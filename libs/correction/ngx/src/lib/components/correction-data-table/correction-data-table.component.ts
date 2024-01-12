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
  mapTo
} from 'rxjs';

import * as papa from 'papaparse';

import { TableConfig } from '@tamu-gisc/ui-kits/ngx/layout/tables';
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
      name: 'Corrected Latitude',
      prop: 'NewLatitude'
    },
    {
      name: 'Corrected Longitude',
      prop: 'NewLongitude'
    }
  ];

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
            switchMap((data) => this.ds.initDb({ name: 'corrections', version: 1, createSchemaFromData: true, data }))
          )
        )
      ),
      this.ds.openDatabase('corrections')
    );

    this.contents = merge(this.db, this._refresh$).pipe(
      switchMap(() => this.ds.getN(250)),
      tap(() => {
        this.cs.notifyDataPopulated();
      })
    );

    this.cs.correctionApplied
      .pipe(
        switchMap(() => {
          return combineLatest([this.cs.selectedRow, this.cs.correction]).pipe(take(1));
        }),
        switchMap(([row, correction]) => {
          return this.ds.updateById(parseInt(row.ID as string), { ...correction });
        })
      )
      .subscribe((result) => {
        console.log(`Fields updated: ${result}`);

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
          const csv = papa.unparse(data);
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

  private _parseCsv(file: File): Observable<Array<Record<string, unknown>>> {
    return new Observable((observer) => {
      papa.parse(file, {
        header: true,
        complete: ({ data }) => {
          observer.next(data);
          observer.complete();
        }
      });
    });
  }
}
