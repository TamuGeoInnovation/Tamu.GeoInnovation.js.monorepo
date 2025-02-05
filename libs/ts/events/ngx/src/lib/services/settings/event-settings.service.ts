import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { EventSettings } from '../../interfaces/graduation.interface';

@Injectable({
  providedIn: 'root'
})
export class EventSettingsService {
  private _settingsPrimaryKey = 'ts-events-settings';

  public get settings(): EventSettings {
    return this.store.getStorage({ primaryKey: this._settingsPrimaryKey });
  }

  /**
   * Retrieves the saved event date from local storage
   */
  public get savedEventType() {
    throw new Error('getSavedEventType: Method not implemented.');
  }

  public get savedAccessible(): boolean {
    if (this.settings !== null && this.settings !== undefined) {
      return this.settings?.accessible ? this.settings.accessible : false;
    } else {
      return false;
    }
  }

  constructor(private readonly env: EnvironmentService, private readonly store: LocalStoreService) {}

  public saveEventType() {
    throw new Error('saveEventType: Method not implemented.');
  }

  public saveAccommodations(requiresAccommodations: boolean) {
    this.store.setStorageObjectKeyValue({
      primaryKey: this._settingsPrimaryKey,
      subKey: 'accessible',
      value: requiresAccommodations
    });

    const confirm = this.store.getStorageObjectKeyValue<boolean>({
      primaryKey: this._settingsPrimaryKey,
      subKey: 'accessible'
    });

    return confirm;
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

  private _validateEvent() {
    throw new Error('_validateEvent: Method not implemented.');
  }
}
