import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import {
  EventAccommodationOption,
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

    return `event=${settings['event']}`;
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

  public eventOptions(): Array<SpecialEventOptions>;
  public eventOptions(asObservable: true): Observable<Array<SpecialEventOptions>>;
  public eventOptions(asObservable: false): Array<SpecialEventOptions>;
  public eventOptions(asObservable?: boolean): Array<SpecialEventOptions> | Observable<Array<SpecialEventOptions>> {
    const options: Array<SpecialEventOptions> = this.env.value('SpecialEventOptions', true);

    if (asObservable) {
      return of(options);
    } else {
      return options;
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
      // Check if params have at least a date and residence
      if (!params['event'] || !params.accessible) {
        console.warn('Invalid query parameters. Will not set settings from query parameters.');
      }

      const accommodations = params.accessible ? this._validateAccommodations(params.accessible) : false;

      this.store.setStorage({
        primaryKey: this._settingsPrimaryKey,
        value: {
          accessible: accommodations
        }
      });

      return this.settings;
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
              label: (option.options.find((o) => o.value === value) as EventAccommodationOption).label
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

  public _validateAccommodations(accommodations: boolean) {
    return accommodations === true;
  }
}
