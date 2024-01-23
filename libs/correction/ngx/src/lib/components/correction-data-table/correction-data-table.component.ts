import { Component, OnDestroy, OnInit } from '@angular/core';
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
  auditTime
} from 'rxjs';

import * as papa from 'papaparse';

import { PaginationEvent, TableConfig } from '@tamu-gisc/ui-kits/ngx/layout/tables';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { DbService } from '../../services/db/db.service';
import { CorrectionService } from '../../services/correction/correction.service';
import { DbResetModalComponent } from '../modals/db-reset-modal/db-reset-modal.component';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import esri = __esri;

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
    }
  ];

  public columnsCount: Observable<number>;

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
    private readonly modal: ModalService
  ) {}

  public ngOnInit(): void {
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

    this.contents = merge(this.db, this._refresh$, this._paginationState$).pipe(
      debounceTime(0), // Some number to ensure we debounce events in the same event loop.
      withLatestFrom(this._paginationState$),
      switchMap(([, pagination]) => {
        return this.ds.getN(pagination.pageSize, pagination.page);
      }),
      tap(() => {
        this.cs.notifyDataPopulated();
      }),
      shareReplay()
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

          console.log(`Applying correction to row ${row.ID}: ${JSON.stringify(obj)}`);

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

    this.columnsCount = this.db.pipe(
      take(1),
      switchMap(() => {
        return this.ds.getCount();
      })
    );
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
}
