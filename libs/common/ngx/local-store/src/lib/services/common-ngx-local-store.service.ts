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
      return undefined;
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

    let content = this.store.get(storeKey);

    if (typeof content === 'object' && content !== null) {
      content[config.subKey] = config.value;
    } else {
      content = {};
      content[config.subKey] = config.value;
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

    const content = this.store.get(storeKey);

    if (typeof content === 'object' && content !== null) {
      if (content[config.subKey] !== undefined) {
        return content[config.subKey];
      }
      return undefined;
    } else {
      return undefined;
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
