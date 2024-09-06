import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  combineLatest,
  Observable,
  race,
  ReplaySubject,
  switchMap,
  take,
  tap,
  merge,
  BehaviorSubject,
  delay,
  startWith,
  of,
  mapTo,
  withLatestFrom,
  shareReplay,
  debounceTime,
  auditTime,
  from
} from 'rxjs';

import * as papa from 'papaparse';

import { PaginationEvent, TableConfig } from '@tamu-gisc/ui-kits/ngx/layout/tables';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { DbService } from '../../services/db/db.service';
import { CorrectionService } from '../../services/correction/correction.service';
import { DbResetModalComponent } from '../modals/db-reset-modal/db-reset-modal.component';

@Component({
  selector: 'tamu-gisc-correction-data-table',
  templateUrl: './correction-data-table.component.html',
  styleUrls: ['./correction-data-table.component.scss']
})
export class CorrectionDataTableComponent implements OnInit, OnDestroy {
  private _file$: ReplaySubject<File> = new ReplaySubject(1);
  private _refresh$: ReplaySubject<boolean> = new ReplaySubject(1);
  private _destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  /**
   * Stores and relays pagination events from the paginator component.
   */
  private _paginationState$: ReplaySubject<PaginationEvent> = new ReplaySubject(1);
  public filtersForm: FormGroup;
  private _loadingData$: ReplaySubject<boolean> = new ReplaySubject(1);
  public loadingData = this._loadingData$.asObservable().pipe(debounceTime(500));

  public file = this._file$.asObservable();
  public db: Observable<IDBDatabase>;
  public contents: Observable<Array<Record<string, unknown>>>;
  public config: TableConfig = [
    {
      name: 'ID',
      prop: 'ID'
    },
    {
      name: 'Address',
      prop: 'Address'
    },
    {
      name: 'City',
      prop: 'City'
    },
    {
      name: 'State',
      prop: 'State'
    },
    {
      name: 'Zip',
      prop: 'Zip'
    },
    {
      name: 'Latitude',
      prop: 'Latitude'
    },
    {
      name: 'Longitude',
      prop: 'Longitude'
    },
    {
      name: 'Penalty Code',
      prop: 'PenaltyCode'
    },
    {
      name: 'Penalty Summary',
      prop: 'PenaltyCodeSummary'
    },
    {
      name: 'Micro Match Status',
      prop: 'MicroMatchStatus'
    },
    {
      name: 'Feature Matching Geography Type',
      prop: 'FeatureMatchingGeographyType'
    },
    {
      name: 'Corrected Latitude',
      prop: 'NewLatitude'
    },
    {
      name: 'Corrected Longitude',
      prop: 'NewLongitude'
    },
    {
      name: 'Corrected Quality',
      prop: 'NewQuality'
    },
    {
      name: 'Correction Notes',
      prop: 'QANotes'
    }
  ];

  public mms_types = [
    {
      name: 'All',
      value: 'All'
    },
    {
      name: 'Match',
      value: 'Match'
    },
    {
      name: 'Interactive',
      value: 'Interactive'
    },
    {
      name: 'Review',
      value: 'Review'
    }
  ];

  public columnsCount: Observable<number>;
  public correctedCount: Observable<number>;

  private _exportStatus: BehaviorSubject<'idle' | 'exporting'> = new BehaviorSubject('idle');
  public exportStatus = this._exportStatus.asObservable();
  public exportStatusMessage = this.exportStatus.pipe(
    switchMap((status) => {
      if (status === 'exporting') {
        return of('Exporting...');
      } else {
        return of('Export').pipe(delay(500), startWith('Export'));
      }
    })
  );

  private readonly _newFields = {
    NewLatitude: '',
    NewLongitude: '',
    NewQuality: '',
    NewSource: '',
    QANotes: '',
    Updated: ''
  };

  constructor(
    private readonly ds: DbService,
    private readonly es: EsriMapService,
    private readonly cs: CorrectionService,
    private readonly ns: NotificationService,
    private readonly modal: ModalService,
    private readonly fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    this.filtersForm = this.fb.group({
      showCorrected: [true],
      mms: ['All']
    });

    this.db = race(
      this.file.pipe(
        switchMap((file) =>
          this._parseCsv(file).pipe(
            switchMap((data) => {
              // DB schema is created from the first item in the data array + additional fields that are used
              // for storing correction data.
              const model = {
                ...data[0],
                ...this._newFields
              };

              // Per the Dexie docs, we should not index huge fields
              delete model['OutputGeocodes'];

              return this.ds.initDb({ name: 'corrections', version: 1, createSchemaFromData: true, data, model });
            })
          )
        ),
        shareReplay() // Replay the inner observable to prevent multiple DB initializations.
      ),
      this.ds.openDatabase('corrections')
    );

    this.contents = merge(this.db, this._refresh$, this._paginationState$, this.filtersForm.valueChanges).pipe(
      debounceTime(50), // Some number to ensure we debounce events in the same event loop.
      withLatestFrom(this._paginationState$),
      tap(() => {
        this._loadingData$.next(true);
      }),
      switchMap(([, pagination]) => {
        const form_state = this._calculateFilters(this.filtersForm.getRawValue());

        if (form_state.showCorrected && form_state.allMMSTypes) {
          // This operation is fast, so if the filters are in their default state, we want to avoid doing extra work.
          return this.ds.getN(pagination.pageSize, pagination.page).pipe(
            tap(() => {
              this._loadingData$.next(false);
            })
          );
        } else {
          return this.ds
            .filterTable((row) => {
              let ret = false;

              if (form_state.allMMSTypes) {
                return true;
              } else {
                if (row.MicroMatchStatus === form_state.mmsType) {
                  ret = true;
                }
              }

              if (form_state.showCorrected) {
                if (row.MicroMatchStatus === 'Interactive') {
                  ret = true;
                }
              }

              return ret;
            })
            .pipe(
              switchMap((col) => {
                return this.ds.getNFromCollection(col, pagination.pageSize, pagination.page).pipe(
                  tap(() => {
                    this._loadingData$.next(false);
                  })
                );
              })
            );
        }
      }),
      tap(() => {
        this.cs.notifyDataPopulated();
      }),
      shareReplay()
    );

    this.columnsCount = merge(this.db, this._refresh$, this.filtersForm.valueChanges).pipe(
      debounceTime(50),
      switchMap(() => {
        const form_state = this._calculateFilters(this.filtersForm.getRawValue());

        if (form_state.showCorrected && form_state.allMMSTypes) {
          return this.ds.getCount();
        } else {
          return this.ds
            .filterTable((row) => {
              let ret = false;

              if (form_state.allMMSTypes) {
                return true;
              } else {
                if (row.MicroMatchStatus === form_state.mmsType) {
                  ret = true;
                }
              }

              if (form_state.showCorrected) {
                if (row.MicroMatchStatus === 'Interactive') {
                  ret = true;
                }
              }

              return ret;
            })
            .pipe(
              switchMap((col) => {
                return from(col.count());
              })
            );
        }
      })
    );

    this.correctedCount = merge(this.db, this._refresh$).pipe(
      debounceTime(50),
      switchMap(() => {
        return this.ds.getWhereWithClause('MicroMatchStatus', 'equals', 'Interactive').pipe(
          switchMap((col) => {
            return from(col.count());
          })
        );
      })
    );

    this.cs.correctionApplied
      .pipe(
        switchMap(() => {
          return combineLatest([this.cs.selectedRow, this.cs.correction, this.cs.miscFields.pipe(auditTime(1))]).pipe(
            take(1)
          );
        }),
        switchMap(([row, correction, fields]) => {
          const obj = { ...correction, ...fields };

          return this.ds.updateById(parseInt(row.ID as string), obj);
        })
      )
      .subscribe((result) => {
        console.log(`Fields updated: ${result}`);

        this.ns.toast({
          id: 'correction-applied',
          title: 'Correction Saved',
          message: 'Successfully applied correction to row.'
        });

        if (result === 1) {
          this._refresh$.next(true);
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public doThing(e: File) {
    this._file$.next(e);
  }

  public emitRowFocused(e: Record<string, unknown>) {
    this.cs.selectRow(e);
  }

  public exportToCsv() {
    this._exportStatus.next('exporting');

    this.ds.getAll().subscribe({
      next: (data) => {
        try {
          // Remove the ID field from the data array.
          // This is to prevent a bug where the output is re-sorted if it is used as input.
          const minusId = data.map((row) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = row;
            return rest;
          });

          // Because corrections can be sporadic throughout a dataset, we are not guaranteed to have
          // the correction fields applied on the first row which is used to generate the csv columns.
          // We will manually provide the list of rows to the csv serializer so that we can ensure
          // that all correction columns through the dataset are correctly exported.

          const columns = Object.keys({ ...minusId[0], ...this._newFields });

          const csv = papa.unparse(minusId, {
            columns
          });

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.setAttribute('hidden', '');
          a.setAttribute('href', url);
          a.setAttribute('download', 'corrections.csv');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          this.ns.toast({
            message: 'DB to CSV export was successful. Check your downloads folder.',
            id: 'exported-corrections',
            title: 'Export Download Started'
          });

          this._exportStatus.next('idle');
        } catch (err) {
          this.ns.toast({
            message: 'Failed to convert data to CSV for export.',
            id: 'exported-corrections',
            title: 'Export Failed'
          });

          console.error(err);

          this._exportStatus.next('idle');
        }
      },
      error: (err) => {
        this.ns.toast({
          message: 'Failed to retrieve data from database for export.',
          id: 'exported-corrections',
          title: 'Export Failed'
        });

        console.error(err);

        this._exportStatus.next('idle');
      }
    });
  }

  public openResetPromptModal() {
    this.modal
      .open(DbResetModalComponent)
      .pipe(
        switchMap((shouldReset) => {
          if (shouldReset) {
            return this.ds.deleteDatabase('corrections').pipe(
              tap(() => {
                console.log('Resetting database...');
              }),
              mapTo(true)
            );
          } else {
            return of(false);
          }
        })
      )
      .subscribe({
        next: (result) => {
          if (result === true) {
            window.location.reload();
          } else {
            console.log('Reset cancelled.');
          }
        },
        error: (err) => {
          console.error(err);

          this.ns.toast({
            message: 'Failed to reset database.',
            id: 'reset-corrections',
            title: 'Reset Failed'
          });
        }
      });
  }

  public recordPaginationEvent(e: PaginationEvent) {
    this._paginationState$.next(e);
  }

  private _parseCsv(file: File): Observable<Array<Record<string, unknown>>> {
    return new Observable((observer) => {
      papa.parse(file, {
        skipEmptyLines: true,
        header: true,
        complete: ({ data }) => {
          observer.next(data);
          observer.complete();
        }
      });
    });
  }

  /**
   * Simple function to calculate state of filters based on the input form.
   */
  private _calculateFilters(form: Record<string, unknown>): {
    showCorrected: boolean;
    allMMSTypes: boolean;
    mmsType: string;
  } {
    const showCorrected = form.showCorrected === true;
    const allMMSTypes = form.mms === 'All' || form.mms === undefined;
    const mmsType = form.mms as string;

    return {
      showCorrected,
      allMMSTypes,
      mmsType
    };
  }
}
