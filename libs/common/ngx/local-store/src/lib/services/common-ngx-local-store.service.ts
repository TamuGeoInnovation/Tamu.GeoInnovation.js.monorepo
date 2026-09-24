import { Inject, Injectable, InjectionToken } from '@angular/core';
import { StorageService } from 'ngx-webstorage-service';

const STORAGE_KEY = 'default';

export const AppStorage = new InjectionToken<StorageService>('AppStorage');
@Injectable({ providedIn: 'root' })
export class LocalStoreService {
  constructor(@Inject(AppStorage) private store: StorageService) {}

  /**
   * Returns value of provided local storage reference.
   *
   * @param config Object
   * @returns If no local storage reference provided in config, application default storage will be used.
   */
  public getStorage<T>(config: StorageConfig): T {
    const storeKey = config.primaryKey || STORAGE_KEY;

    const content = this.store.get(storeKey);

    if (typeof content === 'object' && content !== null) {
      return content;
    } else {
      // The signature claims `T` but this genuinely returns undefined. The cast keeps the existing
      // runtime behaviour; widening the return type to `T | undefined` would force every caller to
      // handle it, which is a public API change and belongs in its own PR.
      return undefined as unknown as T;
    }
  }

  public setStorage<T>(config: ValueConfig<T>): T | undefined {
    const storeKey = config.primaryKey || STORAGE_KEY;

    this.store.set(storeKey, config.value);

    return this.store.get(storeKey);
  }

  /**
   * Sets the value of a key in an optionally provided object stored in Local Storage referenced by storage key.
   * If no storage key reference is provided, the application default storage will be used.
   *
   * If they key does not exist in the referenced object by storage key, it will be created and it's value set
   *
   * @param  config Object
   */
  public setStorageObjectKeyValue<T>(config: ValueConfig<T>): void {
    const storeKey = config.primaryKey || STORAGE_KEY;

    // `subKey` is optional on StorageConfig, so its type is `string | undefined` and it cannot be
    // used as an index. Narrowed here rather than changing the interface, which would affect every
    // caller. Behaviour is unchanged: an undefined subKey indexed as "undefined" before, and still
    // does.
    const subKey = config.subKey as string;

    let content = this.store.get(storeKey);

    if (typeof content === 'object' && content !== null) {
      content[subKey] = config.value;
    } else {
      content = {};
      content[subKey] = config.value;
    }

    this.store.set(storeKey, content);
  }

  /**
   * Gets the value of a key in an optionally provided object stored in Local Storage referenced by storage key.
   * If no storage key reference is provided, the application default storage will be used.
   *
   * @param config Object
   * @returns Undefined if key does not exist, else key value
   */
  public getStorageObjectKeyValue<T>(config: ValueConfig<T>): T {
    const storeKey = config.primaryKey || STORAGE_KEY;

    // See the note in setStorageObjectKeyValue.
    const subKey = config.subKey as string;

    const content = this.store.get(storeKey);

    if (typeof content === 'object' && content !== null) {
      if (content[subKey] !== undefined) {
        return content[subKey];
      }
      return undefined as unknown as T;
    } else {
      return undefined as unknown as T;
    }
  }
}

export interface StorageConfig {
  /**
   * Root local storage key name.
   *
   * Example `user-preferences` for:
   *
   * ```
   *   user-preferences: {
   *      // Key-value pairs here
   *   }
   * ````
   */
  primaryKey?: string;

  /**
   * Sub-root local storage key name.
   *
   * Example `data` for:
   *
   * ```
   *   user-preferences: {
   *       data: {
   *         // Key-value pairs here
   *       }
   *   }
   * ````
   */
  subKey?: string;
}

export interface ValueConfig<T> extends StorageConfig {
  value?: T;
}
