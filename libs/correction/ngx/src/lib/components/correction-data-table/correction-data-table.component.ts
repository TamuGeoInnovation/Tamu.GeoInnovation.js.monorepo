import { Component, OnInit } from '@angular/core';
import { Observable, race, ReplaySubject, switchMap, tap } from 'rxjs';

import * as papa from 'papaparse';

import { IndexDbService } from '../../services/index-db.service';

@Component({
  selector: 'tamu-gisc-correction-data-table',
  templateUrl: './correction-data-table.component.html',
  styleUrls: ['./correction-data-table.component.scss']
})
export class CorrectionDataTableComponent implements OnInit {
  private _file: ReplaySubject<File> = new ReplaySubject();

  public file = this._file.asObservable();
  public db: Observable<IDBDatabase>;
  public contents: Observable<any>;

  constructor(private readonly ds: IndexDbService) {}

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
      switchMap(() => this.ds.getAll()),
      tap((data) => {
        console.log(data);
      })
    );
  }

  public doThing(e: File) {
    this._file.next(e);
  }

  private _parseCsv(file: File): Observable<Array<any>> {
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
