import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import {
  EventAccommodationOption,
  EventConfiguration,
  EventSettings,
  ResolvedEventSettings,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventSettingsService {
  private _settingsPrimaryKey = 'ts-events-settings';

  public get queryParamsFromSettings() {
    const settings = this.settings();

    if (!settings) {
      return null;
    }

    const validSettings = this.validateSettings(settings, this.eventOptions());

    if (!validSettings) {
      return null;
    }

    // Prepare the key-value settings as an array of key-value pairs to create url search params.
    const settingsAsList = Object.entries(validSettings).map((s) => s);

    return new URLSearchParams(settingsAsList);
  }

  /**
   * Returns a boolean result based on whether the event has any settings saved in local storage.
   */
  public get hasSettings() {
    const validSettings = this.validateSettings(this.settings(), this.eventOptions());

    if (validSettings === null) {
      return false;
    }

    return Object.keys(validSettings).length > 0;
  }

  /**
   * Returns a boolean result based on whether the event has any configuration options. This is used to determine
   * whether the event has any settings that can be configured via the builder and/or determine routing behavior.
   */
  public get hasOptions() {
    return this.eventOptions().length > 0;
  }

  constructor(private readonly env: EnvironmentService, private readonly store: LocalStoreService) {}

  public settings(): EventSettings;
  public settings(asObservable: true): Observable<EventSettings>;
  public settings(asObservable: false): EventSettings;
  public settings(asObservable?: boolean): EventSettings | Observable<EventSettings> {
    const settings: EventSettings = this.store.getStorage({ primaryKey: this._settingsPrimaryKey });

    if (asObservable) {
      return of(settings);
    } else {
      return settings;
    }
  }

  public eventOptions(): SpecialEventOptions;
  public eventOptions(asObservable: true): Observable<SpecialEventOptions>;
  public eventOptions(asObservable: false): SpecialEventOptions;
  public eventOptions(asObservable?: boolean): SpecialEventOptions | Observable<SpecialEventOptions> {
    const options: SpecialEventOptions = this.env.value('SpecialEventOptions', true);

    if (asObservable) {
      return of(options);
    } else {
      return options;
    }
  }

  public eventConfiguration(): EventConfiguration;
  public eventConfiguration(asObservable: true): Observable<EventConfiguration>;
  public eventConfiguration(asObservable: false): EventConfiguration;
  public eventConfiguration(asObservable?: boolean): EventConfiguration | Observable<EventConfiguration> {
    const config: EventConfiguration = this.env.value('SpecialEventConfiguration', true);

    if (asObservable) {
      return of(config);
    } else {
      return config;
    }
  }

  public saveAccommodation(accommodationKey: string, accommodationValue: string | boolean | number) {
    this.store.setStorageObjectKeyValue({
      primaryKey: this._settingsPrimaryKey,
      subKey: accommodationKey,
      value: accommodationValue
    });

    const confirm = this.store.getStorageObjectKeyValue<boolean>({
      primaryKey: this._settingsPrimaryKey,
      subKey: accommodationKey
    });

    return confirm;
  }

  public getSavedAccommodation(accommodationKey: string) {
    const settings = this.settings();

    if (settings !== null && settings !== undefined) {
      return settings[accommodationKey] !== undefined ? settings[accommodationKey] : null;
    } else {
      return null;
    }
  }

  public setSettingsFromQueryParams(params: EventSettings) {
    try {
      const settings = this.validateSettings(params, this.eventOptions());

      if (settings === null) {
        return this.store.getStorage({
          primaryKey: this._settingsPrimaryKey
        });
      }

      return this.store.setStorage({
        primaryKey: this._settingsPrimaryKey,
        value: settings
      });
    } catch (err) {
      throw new Error((err as Error)['message']);
    }
  }

  /**
   * Merges the settings from local storage with the environment definitions.
   * to return a dictionary of event option keys with their respective value label and key.
   *
   * This is used for UI representation of the settings.
   */
  public getMergedSettings() {
    const options = this.eventOptions();
    const settings = this.settings();

    return options.reduce((merged, option) => {
      if (settings && settings[option.value] !== undefined) {
        const value = settings[option.value];

        if (value !== undefined) {
          merged[option.value] = {
            shortDescription: option.shortDescription,
            option: {
              value: value,
              label: (option.choices.find((o) => o.value === value) as EventAccommodationOption).label
            }
          };
        } else {
          merged[option.value] = {
            shortDescription: option.shortDescription,
            option: null
          };
        }
      } else {
        merged[option.value] = {
          shortDescription: option.shortDescription,
          option: null
        };
      }

      return merged;
    }, {} as ResolvedEventSettings);
  }

  public accommodationsValid() {
    const options = this.eventOptions();
    const settings = this.settings();

    return options.every((opt) => {
      return settings?.[opt.value] !== undefined;
    });
  }

  /**
   * Validates the provided settings object against the provided event options.
   *
   * Returns a new settings object with only the keys that exist in the event options with a valid value.
   */
  public validateSettings(settings: EventSettings, options: SpecialEventOptions): EventSettings | null {
    const validated = Object.entries(settings).reduce((acc, [key, setting]) => {
      const option = options.find((o) => o.value === key);
      // Find the event option that has the current settings key in its options

      if (option) {
        // Determine if the current setting value is in the list of valid options for the current option
        const valid = option.choices.some((opt) => opt.value === setting);

        if (valid) {
          acc[key] = setting;
        } else {
          console.warn(`Setting for key '${key}' is not valid according to provided options.`);
        }
      } else {
        console.warn(`Setting for key '${key}' is not valid according to provided options.`);
      }

      return acc;
    }, {} as EventSettings);

    if (Object.keys(validated).length === 0) {
      return null;
    } else return validated;
  }
}
