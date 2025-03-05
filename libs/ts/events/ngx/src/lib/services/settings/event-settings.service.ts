import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { EventSettings } from '../../interfaces/special-event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventSettingsService {
  private _settingsPrimaryKey = 'ts-events-settings';

  public get settings(): EventSettings {
    return this.store.getStorage({ primaryKey: this._settingsPrimaryKey });
  }

  constructor(private readonly env: EnvironmentService, private readonly store: LocalStoreService) {}

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
    if (this.settings !== null && this.settings !== undefined) {
      return this.settings[accommodationKey] !== undefined ? this.settings[accommodationKey] : null;
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

  public get queryParamsFromSettings() {
    const settings = this.settings;

    if (!settings) {
      return null;
    }

    return `event=${settings['event']}`;
  }

  private _validateAccommodations(accommodations: boolean) {
    return accommodations === true;
  }
}
