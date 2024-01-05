import { Injectable } from '@angular/core';
import { catchError, from, mapTo, NEVER, Observable, of, switchMap } from 'rxjs';

import { Dexie } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private _db;
  private _config: Omit<DBConfig, 'data'>;

  /**
   * Creates Indexed DB database with the provided configuration.
   *
   * When data is provided:
   *
   * 1. Creates a new object store with the name `data`.
   * 2. Creates an index for each key in the first item of the data array.
   * 3. Adds each item in the data array to the object store.
   */
  public initDb({ name, version = 1, createSchemaFromData = true, data }: DBConfig): Observable<IDBDatabase> {
    this._config = { name, version, createSchemaFromData };

    this._db = new Dexie(name);

    if (!createSchemaFromData) {
      throw new Error('Creating database with schema not supported yet, but database has already been created.');
    }

    if (data && data instanceof Array) {
      const indexes = Object.keys(data[0])
        .filter((key) => {
          return key.includes('AUTO_') === false;
        })
        .join(',');

      this._db.version(version).stores({
        data: `++id,${indexes}`
      });

      return from(this._db.table('data').bulkAdd(data)).pipe(mapTo(this._db));
    } else {
      console.log('No data provided. Empty database created.');
    }
  }

  public openDatabase(name: string): Observable<IDBDatabase> {
    const db = new Dexie(name);

    return from(db.open()).pipe(
      switchMap((db) => {
        this._db = db;
        return of(this._db);
      }),
      catchError((err) => {
        console.log('Requested database does not exist. Emitting NEVER.', err.message);
        return NEVER;
      })
    );
  }

  public deleteDatabase() {
    window.indexedDB.deleteDatabase(this._config.name);
  }

  public getAll(): Observable<Array<Record<string, unknown>>> {
    return from(this._db.table('data').toArray() as Promise<Array<Record<string, unknown>>>);
  }

  public getN(count: number): Observable<Array<Record<string, unknown>>> {
    return from(this._db.table('data').limit(count).toArray() as Promise<Array<Record<string, unknown>>>);
  }

  public updateById(id: number | string, data: Record<string, unknown>): Observable<number> {
    return from(this._db.table('data').update(id, data) as Promise<number>);
  }
}

export interface DBConfig {
  name: string;
  version: number;
  createSchemaFromData: boolean;
  data: Array<Record<string, unknown>>;
}
