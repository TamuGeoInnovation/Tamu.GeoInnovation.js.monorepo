import { Injectable } from '@angular/core';
import { catchError, from, mapTo, NEVER, Observable, of, switchMap } from 'rxjs';

import { Collection, Dexie } from 'dexie';

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
   * This is a wrapper around the collection getN method.
   *
   * @param {number} count The number of records to return
   * @param {number} [page] Used to calculate the offset, if provided
   */
  public getN(count: number, page?: number): Observable<Array<Record<string, unknown>>> {
    const collection = this._db.table('data').toCollection();

    return this.getNFromCollection(collection, count, page);
  }

  /**
   * Returns a subset of records from the database.
   */
  public getNFromCollection(
    collection: Collection,
    count: number,
    page?: number
  ): Observable<Array<Record<string, unknown>>> {
    if (page !== undefined && !Number.isNaN(page) && page > 1) {
      collection = collection.offset((page - 1) * count);
    }

    const ret = collection.limit(count).toArray() as Promise<Array<Record<string, unknown>>>;

    return from(ret);
  }

  public getWhereWithClause(
    key: string,
    operator: 'equals' | 'notEqual' | 'startsWith',
    condition: string | boolean | number
  ): Observable<Collection<Record<string, unknown>>> {
    let table = this._db.table('data');

    if (operator === 'equals') {
      table = table.where(key).equals(condition);
    } else if (operator === 'notEqual') {
      table = table.where(key).notEqual(condition);
    } else if (operator === 'startsWith') {
      table = table.where(key).startsWith(condition);
    }

    return of(table);
  }

  public filterTable(predicate: (item: Record<string, unknown>) => boolean): Observable<Collection> {
    return of(this._db.table('data').filter(predicate));
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
