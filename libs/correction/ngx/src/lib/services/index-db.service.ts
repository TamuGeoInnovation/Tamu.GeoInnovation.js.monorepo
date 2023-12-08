import { Injectable } from '@angular/core';
import { from, fromEvent, map, merge, NEVER, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {
  private _db: IDBDatabase;
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

    const request = window.indexedDB.open(name, version);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!createSchemaFromData) {
        console.log(
          'Creating database with schema not supported yet, but database has already been created. Deleting database...'
        );

        db.close();
        this.deleteDatabase();
      }

      if (data && data instanceof Array) {
        const objectStore = db.createObjectStore('data', { autoIncrement: true });

        Object.entries(data[0])
          .filter(([key]) => {
            return key.includes('AUTO_') === false;
          })
          .forEach(([key]) => {
            objectStore.createIndex(key, key, { unique: false });
          });

        objectStore.transaction.oncomplete = () => {
          const objectStore = db.transaction('data', 'readwrite').objectStore('data');

          data.forEach((item) => {
            objectStore.add(item);
          });
        };
      } else {
        console.log('No data provided. Creating empty database.');
      }
    };

    return merge(
      fromEvent<IDBDatabase>(request, 'success').pipe(tap((db) => (this._db = request.result))),
      fromEvent(request, 'error').pipe(
        switchMap((e) => {
          throw e;
        })
      )
    );
  }

  public openDatabase(name: string): Observable<IDBDatabase> {
    // Check if an indexedDB database has already been created.
    return from(window.indexedDB.databases()).pipe(
      switchMap((dbs) => {
        const db = dbs.find((item) => item.name === name);

        if (db) {
          const handler = window.indexedDB.open(name);

          return fromEvent<IDBDatabase>(handler, 'success').pipe(tap((db) => (this._db = handler.result)));
        } else {
          return NEVER;
        }
      })
    );
  }

  public deleteDatabase() {
    window.indexedDB.deleteDatabase(this._config.name);
  }

  public getAll(): Observable<Array<any>> {
    const transaction = this._db.transaction('data', 'readonly');
    const store = transaction.objectStore('data');

    const request = store.getAll();

    return fromEvent(request, 'success').pipe(map(() => request.result));
  }
}

export interface DBConfig {
  name: string;
  version: number;
  createSchemaFromData: boolean;
  data: Array<any>;
}
