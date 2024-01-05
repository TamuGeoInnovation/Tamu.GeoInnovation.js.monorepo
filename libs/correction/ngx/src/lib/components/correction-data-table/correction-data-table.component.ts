import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, race, ReplaySubject, switchMap, take, tap, merge } from 'rxjs';

import * as papa from 'papaparse';

import { TableConfig } from '@tamu-gisc/ui-kits/ngx/layout/tables';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { DbService } from '../../services/db/db.service';
import { CorrectionService } from '../../services/correction/correction.service';

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

  constructor(private readonly ds: DbService, private es: EsriMapService, private readonly cs: CorrectionService) {}

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
          return combineLatest([this.cs.selectedRow, this.cs.correctionPoint]).pipe(take(1));
        }),
        switchMap(([row, point]) => {
          return this.ds.updateById(parseInt(row.ID as string), { NewLatitude: point.lat, NewLongitude: point.lon });
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
