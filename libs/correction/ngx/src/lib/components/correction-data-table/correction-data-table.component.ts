import { Component, OnInit } from '@angular/core';
import { Observable, race, ReplaySubject, switchMap, tap } from 'rxjs';

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
export class CorrectionDataTableComponent implements OnInit {
  private _file: ReplaySubject<File> = new ReplaySubject();

  public file = this._file.asObservable();
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

    this.contents = this.db.pipe(
      switchMap(() => this.ds.getN(250)),
      tap(() => {
        this.cs.notifyDataPopulated();
      })
    );
  }

  public doThing(e: File) {
    this._file.next(e);
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
