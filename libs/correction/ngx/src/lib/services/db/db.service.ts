import { Injectable } from '@angular/core';
import { catchError, from, mapTo, NEVER, Observable, of, switchMap } from 'rxjs';

import { Dexie } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private _db;
  private _config: Omit<DBConfig, 'model' | 'data'>;

  /**
   * Creates Indexed DB database with the provided configuration.
   *
   * When data is provided:
   *
   * 1. Creates a new object store with the name `data`.
   * 2. Creates an index for each key in the first item of the data array.
   * 3. Adds each item in the data array to the object store.
   */
  public initDb({ name, version = 1, createSchemaFromData = true, data, model }: DBConfig): Observable<IDBDatabase> {
    this._config = { name, version, createSchemaFromData };

    this._db = new Dexie(name);

    if (!createSchemaFromData) {
      throw new Error('Creating database with schema not supported yet, but database has already been created.');
    }

    if (model || (data && data instanceof Array)) {
      // Preferentially use the provided model, but if it is not provided, use the first item in the data array.
      const m = model ? model : data[0];

      const indexes = Object.keys(m)
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

  public deleteDatabase(name: string) {
    if (!name) {
      throw new Error('No database name provided.');
    }

    return from(Dexie.delete(name));
  }

  public getAll(): Observable<Array<Record<string, unknown>>> {
    return from(this._db.table('data').toArray() as Promise<Array<Record<string, unknown>>>);
  }

  /**
   * Returns a subset of records from the database.
   *
   * @param {number} count The number of records to return
   * @param {number} [page] Used to calculate the offset, if provided
   */
  public getN(count: number, page?: number): Observable<Array<Record<string, unknown>>> {
    const table = this._db.table('data');

    if (page !== undefined && !Number.isNaN(page) && page > 1) {
      return table
        .offset((page - 1) * count)
        .limit(count)
        .toArray() as Observable<Array<Record<string, unknown>>>;
    } else {
      return table.limit(count).toArray() as Observable<Array<Record<string, unknown>>>;
    }
  }

  public updateById(id: number | string, data: Record<string, unknown>): Observable<number> {
    return from(this._db.table('data').update(id, data) as Promise<number>);
  }

  public getCount(): Observable<number> {
    return from(this._db.table('data').count() as Promise<number>);
  }
}

export interface DBConfig {
  /**
   * Name of the database.
   */
  name: string;

  version: number;

  /**
   * Whether to create the database schema from the data provided.
   */
  createSchemaFromData: boolean;

  /**
   * Data to populate the database with.
   */
  data: Array<Record<string, unknown>>;

  /**
   * Model to use for creating the database schema. Use this if you want to create a schema that is different from the data provided.
   *
   * Cases where this is necessary include when the data provided is not representative of the data that will be added to the database.
   *
   * For example, if the data provided is a subset of the data that will be added to the database, the model should be the full set of data.
   */
  model?: Record<string, unknown>;
}
