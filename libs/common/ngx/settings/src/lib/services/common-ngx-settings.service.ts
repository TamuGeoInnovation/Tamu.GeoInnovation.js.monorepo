import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap, distinctUntilChanged } from 'rxjs/operators';

import { StorageConfig, LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _Store: BehaviorSubject<CompoundSettings> = new BehaviorSubject({});
  private readonly Store: Observable<CompoundSettings> = this._Store.asObservable();

  private _localStorageSettings: StorageConfig = {
    primaryKey: 'user-preferences'
  };

  constructor(private storage: LocalStoreService) {}

  /**
   * Service initialization method.
   *
   * Each injecting service with shared stateful settings must call this initialization method.
   *
   * @param config Initialization configuration
   * @returns Initialized settings observable
   */
  public init(config: SettingsInitializationConfig): Observable<CompoundSettings> {
    // Stored settings will be a flat
    const storageInjected: CompoundSettings = Object.keys(config.settings).reduce(
      (acc, curr) => {
        acc[curr] = { ...config.settings[curr], storage: config.storage };
        return acc;
      },
      {} as CompoundSettings
    );

    // Get full local storage from storage confiration. Provided config can override storage `primaryKey`
    const storage = this.getStorage({ ...this._localStorageSettings, ...config.storage });

    // Local storage returns a simple settings tree. This needs to be converted to a compound settings collection
    // in order to incorporate existing peristent values that will be merged with matching initialized settings
    // from the provided configuration.
    const compoundsFromStorageTree = this.simpleSettingsTreeToCompoundSettings(storage);

    // Override any settings with locally stored setting values (if any).
    const merged: CompoundSettings = Object.keys(storageInjected).reduce((acc, curr, index, arr) => {
      if (compoundsFromStorageTree.hasOwnProperty(curr)) {
        acc[curr] = { ...storageInjected[curr], value: compoundsFromStorageTree[curr].value };
        return acc;
      } else {
        acc[curr] = { ...storageInjected[curr] };
        return acc;
      }
    }, {});

    const newStoreValue = { ...this._Store.getValue(), ...storageInjected, ...merged };

    this._Store.next(newStoreValue);

    return this.calculateReturnValues(config.settings).pipe(
      this.compoundToSimpleSettingsBranch$(),
      distinctUntilChanged(this.checkSimpleSettingsEquality),
      tap((flattened) => {
        const persistent = this.getPersistentSimpleSettings(flattened, merged);

        this.setStorage(persistent, config.storage);
      })
    );
  }

  /**
   * Retrieves the entirety of the local storage travel options object.
   *
   * Handles an `undefined` value before, which the service state must not be.
   */
  private getStorage(config: StorageConfig): SimpleSettingTree {
    const storage: SimpleSettingTree | null = this.storage.getStorage(config);

    if (storage) {
      return storage;
    } else {
      return {};
    }
  }

  /**
   * Overwrites the locally stored settings with the provided storage sub-key.
   *
   */
  private setStorage(content: SimpleSettingBranch, storageConfig: StorageConfig) {
    this.storage.setStorageObjectKeyValue({
      primaryKey: this._localStorageSettings.primaryKey,
      subKey: storageConfig.subKey,
      value: content
    });
  }

  /**
   * Accepts any partial flattened collection of settings and values and attempts to update the
   * service and local store.
   *
   * Keys for which the local service does not have a settings configuration will be ignored.
   *
   * This method does not delete existing keys.
   */
  public updateSettings(settingsToUpdate: SimpleSettingBranch): void {
    // Cache the service store value. Will use this pure value for processing.
    const storeSettings = this._Store.getValue();

    // Filter the provided settings keys if it already exists in the service store,
    // with newly assigned values.
    const providedMatching = Object.keys(settingsToUpdate).reduce(
      (acc, curr) => {
        // If the setting to be updated does exist in service state, ignore it because it
        // lack information build a `CompoundSettings`.
        if (!storeSettings.hasOwnProperty(curr)) {
          return acc;
        }

        // If the setting to be updated exists in service state, there is `CompoundSettings`
        // information that describes how the property was being used. If it has a `get` effect,
        // don't update the service value for the setting key currently being iterated.
        //
        // If a property has a `get` effect, it's a reference to another setting value with some
        // potential transformation applied to it. Because of this, if we update the current setting
        // with the value received, any other services subscribing to the service state will not be
        // notified of changes.
        if (!storeSettings[curr].effects || !storeSettings[curr].effects.get) {
          acc[curr] = { ...storeSettings[curr], value: settingsToUpdate[curr] };
          return acc;
        }

        // At this point it has been determined that the setting to be changed DOES exist in service state
        // as a compound setting, has effects, and at least a `get` effect.
        //
        // If the service setting does not have a `set` effect, ignore the setting. This will later result
        // in the existing service value to be inherited.
        if (!storeSettings[curr].effects.set) {
          console.warn(`${curr} does not have a 'set' effect. Ignoring setting update.`);
          return acc;
        }

        // If the compound setting referece to the current setting to be changed DOES HAVE a `set` effect,
        // make final check to make sure the `set` effect has a target and a evaluating function..
        if (!storeSettings[curr].effects.set.target || !storeSettings[curr].effects.set.fn) {
          console.warn(`${curr} does not have 'set' target or function. Ignoring setting update.`);
          return acc;
        }

        // Check that the comound effect target exists in the store settings. If it doesn't the process will throw an error.
        if (!storeSettings[storeSettings[curr].effects.set.target]) {
          console.warn(`${storeSettings[curr].effects.set.target} setting does not exist. Ignoring setting update.`);
          return acc;
        }

        // Execute the effect `set` function to calculate the value. Use the value of the current provided setting-to-change
        // as the parameter.
        const value = storeSettings[curr].effects.set.fn(settingsToUpdate[curr]);

        // Update the value of the target setting.
        acc[storeSettings[curr].effects.set.target] = {
          ...storeSettings[storeSettings[curr].effects.set.target],
          value
        };
        return acc;
      },
      {} as CompoundSettings
    );

    // If any of the provided settings matched existing settings in the service store,
    // proceed to update the values.
    if (Object.keys(providedMatching).length > 0) {
      const newStore = { ...storeSettings, ...providedMatching };

      this._Store.next(newStore);
    }

    // If the length of the the keys in the provided settings and the service store settings differ, send
    // console warning.
    if (Object.keys(providedMatching).length !== Object.keys(settingsToUpdate).length) {
      console.warn(`At least one setting was not updated because it has not been registered.`);
    }
  }

  /**
   * Calculates the setting value fields from their reference functions, if any.
   *
   * If no functions assigned to the setting, use their base `value`.
   *
   * @param returnSettings Settings collection from the initialization configuration, determining type of
   * the return observable stream.
   */
  private calculateReturnValues(returnSettings: Settings): Observable<CompoundSettings> {
    return this._Store.asObservable().pipe(
      switchMap((settings) => {
        const calculated = Object.keys(settings).reduce(
          (acc, setting, index) => {
            // Skip properties not included in the initialization configuration.
            // This is effectively in the same reducing step.
            if (!returnSettings.hasOwnProperty(setting)) {
              return acc;
            }

            // Check if the setting has a return getter effect. If it doesn't return early.
            if (!settings[setting].effects || !settings[setting].effects.get) {
              acc[setting] = { ...settings[setting], value: settings[setting].value };
              return acc;
            }

            // Convert the target to an array if it's not. This facilitates support for both strings and arrays
            // if we only have to worry about one type.
            const targets: string[] =
              settings[setting].effects.get.target instanceof Array
                ? (settings[setting].effects.get.target as string[])
                : [settings[setting].effects.get.target as string];

            // Checks that all targets exist in settings store.
            const allTargetsExist = targets.every((target) => {
              return settings.hasOwnProperty(target);
            });

            // If at least one of the targets does not exist, return early
            if (!allTargetsExist) {
              acc[setting] = { ...settings[setting], value: settings[setting].value };
              return acc;
            }

            // Get values of all targets
            const values = targets.map((target) => {
              return settings[target].value;
            });

            // Get value of setting effect getter function
            const value = settings[setting].effects.get.fn(...values);

            acc[setting] = { ...settings[setting], value };
            return acc;
          },
          {} as CompoundSettings
        );

        return of(calculated);
      })
    );
  }

  /**
   * Compare function used to check the keys and values of two flat simple setting collections.
   *
   * Used as the compare function in the intialization return observable to prevent any service
   * value update from notifying subscribers that are not concerned with setting value changes other
   * than the ones they have initialized their subscription with.
   *
   */
  private checkSimpleSettingsEquality(previous, current): boolean {
    return Object.keys(current).every((key) => {
      if (previous.hasOwnProperty(key)) {
        return previous[key] === current[key];
      } else {
        return false;
      }
    });
  }

  /**
   * Groups settings by storage `subKey`, creating a branch.
   *
   * All branches are then combined into one `subKey` indexed object, called a tree.
   *
   * Flattening is the required format for updating the local storage.
   */
  private compoundToSimpleSettingsTree(settings: CompoundSettings): SimpleSettingTree {
    const groups = Object.keys(settings).reduce((acc, curr) => {
      // Check if an object with the key value of the setting subKey exists.
      //
      // If it does, add the setting as a child.
      // If it doesn't, make the object with the value of the setting subKey, and add setting a child.
      const settingSubKey = settings[curr].storage.subKey;

      if (acc[settingSubKey]) {
        acc[settingSubKey][curr] = settings[curr].value;
        return acc;
      } else {
        acc[settingSubKey] = {};
        acc[settingSubKey][curr] = settings[curr].value;
        return acc;
      }
    }, {});

    return groups;
  }

  private simpleSettingsTreeToCompoundSettings(tree: SimpleSettingTree): CompoundSettings {
    return Object.keys(tree).reduce(
      (settings, branch) => {
        // All settings branches should be flat simple settings collections.
        if (typeof tree[branch] === 'object') {
          const branchSettings = Object.keys(tree[branch]).reduce(
            (compound, key) => {
              compound[key] = {
                storage: {
                  subKey: branch
                },
                value: tree[branch][key]
              };

              return compound;
            },
            {} as CompoundSettings
          );

          return { ...settings, ...branchSettings };
        } else {
          throw new Error(`Settings branch is not simple.`);
        }
      },
      {} as CompoundSettings
    );
  }

  /**
   * Maps compound settings into simple settings.
   *
   * This is the required format for updating the local storage value.
   *
   * Compound settings example:
   *
   * ```
   *  travel_mode: {
   *   persistent: true,
   *   value: 1,
   *   fn: () => {} // return value,
   *   storage: {
   *      subKey: 'sub-key-value'
   *    },
   *  some_prop: {...},
   *  some_other_prop: {...}
   *  }
   * ```
   *
   * Simple settings example:
   *
   * ```
   *  {
   *   travel_mode: 1,
   *   some_prop: 'value',
   *   some_other_prop: 'other_value'
   *  }
   * ```
   */
  private compoundToSimpleSettingsBranch(settings): SimpleSettingBranch {
    return Object.keys(settings).reduce((acc, curr) => {
      acc[curr] = settings[curr].value;
      return acc;
    }, {});
  }

  /**
   * RxJS Operator wrapper for `flattenSettings()`
   */
  private compoundToSimpleSettingsBranch$() {
    return (source) =>
      source.pipe(
        switchMap((settings) => {
          return of(this.compoundToSimpleSettingsBranch(settings));
        })
      );
  }

  /**
   * Return a string list of the settings with truthy persistent key value.
   *
   * Persistent keys are those that are stored in the local storage.
   *
   * @param  [settings] If not provided, the service store value will be used.
   */
  private getPersistentCompoundSettingsKeys(settings?: CompoundSettings | Settings) {
    const cached = settings || this._Store.getValue();

    return Object.keys(cached).filter((key) => {
      return cached[key].persistent;
    });
  }

  /**
   * Filters the provided settings if they are defined as persistent in storage.
   *
   */
  private getPersistenCompoundtSettings(settings: CompoundSettings): CompoundSettings {
    return Object.keys(settings).reduce((acc, curr) => {
      if (settings[curr].persistent) {
        acc[curr] = settings[curr];
        return acc;
      } else {
        return acc;
      }
    }, {});
  }

  /**
   * Filters a collection of simple settings (which don't contain the `persistent` property) against a collection
   * of keys.
   *
   * - If `sourceOrKeys` is an array of strings, use the value as keys.
   *
   * - If `sourceOrKeys` is a collection of `CompoundSettings`, call `getPersistentKeys()` and use the output as keys.
   *
   * @param  simpleSettings Flattened settings.
   * @param  compoundSourceOrKeys The result of `getPersistentKeys()` or a collection of source `CompoundSettings`.
   */
  private getPersistentSimpleSettings(
    simpleSettings: SimpleSettingBranch,
    compoundSourceOrKeys: string[] | CompoundSettings
  ): SimpleSettingBranch {
    let keys: string[];

    if (compoundSourceOrKeys instanceof Array) {
      keys = compoundSourceOrKeys;
    } else {
      keys = this.getPersistentCompoundSettingsKeys(compoundSourceOrKeys);
    }

    return Object.keys(simpleSettings).reduce(
      (acc, curr) => {
        if (keys.includes(curr)) {
          acc[curr] = simpleSettings[curr];
          return acc;
        } else {
          return acc;
        }
      },
      {} as SimpleSettingBranch
    );
  }

  /**
   * Returns a simple settings collection for for a storage subKey (branch).
   *
   */
  public getSimpleSettingsBranch(branch: string): Observable<SimpleSettingBranch> {
    return this.Store.pipe(
      switchMap((settings) => {
        return of(
          Object.keys(settings).reduce((acc, curr) => {
            if (settings[curr].storage.subKey === branch) {
              acc[curr] = settings[curr];
              return acc;
            } else {
              return acc;
            }
          }, {})
        );
      }),
      this.compoundToSimpleSettingsBranch$()
    );
  }
}

export interface SettingsInitializationConfig {
  /**
   * Describes how the associated settings will be stored. The settings service
   * species a default local storage primary key of `user-preferences`.
   *
   * Unless the primary key is explicitly defined in the configuration, the service will use
   * the default value.
   *
   * The `subKey` defines the setting 'branch', where each branch should store settings by
   * feature, category, etc.
   */
  storage: StorageConfig;

  /**
   * Definition format for service initialization format. The configuration is stored in the service
   * state, however `init()` class method will only return a flat simple setting collection.
   */
  settings: Settings;
}

export interface Settings {
  [key: string]: {
    /**
     * Describes whether this setting value will be stored and updated in client-side local
     * storage. In doing so, the value will persist across application sessions until their
     * local storage expires or is reset.
     *
     * Defaults to `false`
     *
     */
    persistent?: boolean;

    /**
     * Initial setting value. If an existing persitent value exists, it will be updated
     * at initialization.
     */
    value: boolean | string | number;

    /**
     * Optional function that is performed on service value update.
     *
     * Common use cases include shared settings (aliasing) from multiple initialized
     * configurations and conditional value setting.
     */
    effects?: SettingEffects;
  };
}

interface SettingEffects {
  /**
   * Value transformation at the time of calculation.
   *
   * Does not impact origin settings service state.
   *
   * **IMPORTANT**: If getting value by aliasing, this setting must not be `persistent`
   * because persistance is implied elsewhere.
   */
  get?: SettingEffectsGetFunction;

  /**
   * Value transformation applied to a setting in the service state.
   *
   * **CAUTION**: Has the potential to impact origin settings service state.
   */
  set?: SettingEffectsSetFunction;
}

interface SettingEffectsGetFunction {
  /**
   * Setting key for an existing, or to exist, setting in the service state.
   *
   * If the setting does not exist, the effect will be cancelled. Once the
   * setting exists, the effect function will run against the target setting value.
   */
  target: string | string[];

  /**
   * Function that will run against the target setting, if it exists, on every service
   * value change if the subscribed service is concerned with it as specified in the
   * initialization configuration.
   *
   * The result of the function will be returned. This is helpful for aliasing a target setting
   * value, returning conditional values that include returning a completely different data type.
   *
   * This method will not mutate settings service state.
   *
   * @param valueOrValues A single value if the target setting is a string. An array of
   * values if the target is an array of strings.
   */
  fn(...valueOrValues: any[]): any;
}

interface SettingEffectsSetFunction {
  /**
   * Setting key for an existing, or to exist, setting in the service state.
   *
   * If the setting does not exist, the effect will be cancelled.
   */
  target: string;

  /**
   * Function that will run against the target setting, if it exists, any time the requesting setting
   * value is updated. This helps prevent unintended side effects.
   *
   * The result of the function will be assigned to the target setting.
   *
   * This method WILL mutate settings service state.
   *
   * @param [value] Value of the target setting.
   */
  fn(value?): any;
}

interface CompoundSettings {
  [key: string]: {
    storage: StorageConfig;
    persistent?: boolean;
    value?: boolean | string | number;
    effects?: SettingEffects;
  };
}

interface SimpleSettingTree {
  [key: string]: {
    [key: string]: boolean | string | number;
  };
}

interface SimpleSettingBranch {
  [key: string]: boolean | string | number;
}
