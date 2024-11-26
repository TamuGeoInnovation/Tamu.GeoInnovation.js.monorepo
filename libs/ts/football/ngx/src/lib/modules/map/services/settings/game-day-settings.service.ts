import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { FootballSettings, QueryParamSettings, SHOWDOWN_EVENT } from '../../../../interfaces/football.interface';

@Injectable({
  providedIn: 'root'
})
export class GameDaySettingsService {
  private _settingsPrimaryKey = 'game-day-settings';

  public get settings(): FootballSettings {
    return this.store.getStorage({ primaryKey: this._settingsPrimaryKey });
  }

  /**
   * Retrieves the saved event date from local storage
   */
  public get savedEventType() {
    return this.settings?.event;
  }

  public get savedAccessible() {
    return this.settings?.accessible;
  }

  constructor(private readonly env: EnvironmentService, private readonly store: LocalStoreService) {}

  public saveEventType(eventType: SHOWDOWN_EVENT) {
    this.store.setStorageObjectKeyValue({
      primaryKey: this._settingsPrimaryKey,
      subKey: 'event',
      value: eventType
    });

    // Verify that the value store was successful.
    const confirm = this.store.getStorageObjectKeyValue<string>({
      primaryKey: this._settingsPrimaryKey,
      subKey: 'event'
    });

    return confirm;
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

  public setSettingsFromQueryParams(params: QueryParamSettings) {
    try {
      // Check if params have at least a date and residence
      if (!params.event || !params.accessible) {
        console.warn('Invalid query parameters. Will not set settings from query parameters.');
      }

      const event = params.event ? this._validateEvent(params.event) : false;
      const accommodations = params.accessible ? this._validateAccommodations(params.accessible) : false;

      this.store.setStorage({
        primaryKey: this._settingsPrimaryKey,
        value: {
          event: event,
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

    return `event=${settings.event}`;
  }

  private _validateAccommodations(accommodations: string) {
    if (accommodations === 'true' || accommodations === 'false') {
      return accommodations === 'true';
    }

    throw new Error('Invalid accommodations value');
  }

  private _validateEvent(event: SHOWDOWN_EVENT) {
    if (Object.values(SHOWDOWN_EVENT).includes(event)) {
      return event;
    }

    throw new Error('Invalid event value');
  }
}
