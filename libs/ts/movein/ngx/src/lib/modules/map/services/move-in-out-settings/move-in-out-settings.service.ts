import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import {
  MoveDates,
  MoveEventType,
  MoveInSettings,
  QueryParamSettings,
  ResidenceHall,
  ResidenceZones
} from '../../../../interfaces/move-in-out.interface';
import { RESIDENCES } from '../../../../dictionaries/move-in-out.dictionary';

@Injectable({
  providedIn: 'root'
})
export class MoveInOutSettingsService {
  private _settingsPrimaryKey = 'aggiemap-movein';

  public days: MoveDates = this.env.value('MoveInOutDates', false);
  public zones: ResidenceZones = RESIDENCES;

  public get settings(): MoveInSettings {
    return this.store.getStorage({ primaryKey: this._settingsPrimaryKey });
  }

  /**
   * Retrieves the saved event date from local storage
   */
  public get eventDate() {
    return this.settings?.date;
  }

  public get savedResidence() {
    return this.settings?.residence;
  }

  public get savedAccessible() {
    return this.settings?.accessible;
  }

  constructor(private readonly env: EnvironmentService, private readonly store: LocalStoreService) {}

  public saveEventDate(date: Date) {
    this.store.setStorageObjectKeyValue({
      primaryKey: this._settingsPrimaryKey,
      subKey: 'date',
      value: date.getDate().toString()
    });

    // Verify that the value store was successful.
    const confirm = this.store.getStorageObjectKeyValue<string>({
      primaryKey: this._settingsPrimaryKey,
      subKey: 'date'
    });

    return confirm;
  }

  public saveResidence(res: ResidenceHall) {
    // Iterate through residence hall zones and find the zone that includes the provided residence hall.
    // This is used to determine which zone the residence hall belongs to.
    const zone = Object.keys(this.zones).find((key) => {
      return this.zones[key].halls.find((hall) => {
        return hall.name === res.name;
      });
    });

    if (zone !== undefined) {
      // Append zone to the residence. Used to render map elements based on region
      res.zone = this.zones[zone].name;

      this.store.setStorageObjectKeyValue({
        primaryKey: this._settingsPrimaryKey,
        subKey: 'residence',
        value: res
      });

      // Verify that the value store was successful.
      const confirm = this.store.getStorageObjectKeyValue<ResidenceHall>({
        primaryKey: this._settingsPrimaryKey,
        subKey: 'residence'
      });

      return confirm;
    } else {
      console.error('Zone not found for hall ', res.name);
      return null;
    }
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
      if (!params.date || !params.residence) {
        console.warn('Invalid query parameters. Will not set settings from query parameters.');
      }

      const date = this._validateDate(params.date, 'in');
      const residence = this._validateResidence(params.residence);
      const accommodations = params.accessible ? this._validateAccommodations(params.accessible) : false;

      this.store.setStorage({
        primaryKey: this._settingsPrimaryKey,
        value: {
          date: date.day.toString(),
          residence: residence,
          accessible: accommodations
        }
      });

      return this.settings;
    } catch (err) {
      throw new Error((err as Error)['message']);
    }
  }

  private _validateDate(date: string, event: MoveEventType) {
    const day = this.days[event].find((d) => {
      return d.day.toString() === date;
    });

    if (!day) {
      throw new Error('Invalid date');
    }

    return day;
  }

  private _validateResidence(buildingNumber: string) {
    const match = Object.entries(this.zones).find(([key]) => {
      return this.zones[key].halls.find((hall) => {
        return hall.Bldg_Number.includes(buildingNumber);
      });
    });

    if (!match) {
      throw new Error('Invalid residence hall (no zone identified)');
    }

    const [, zone] = match;

    const residence = zone.halls.find((hall) => {
      return hall.Bldg_Number.includes(buildingNumber);
    });

    if (residence === undefined) {
      throw new Error('Invalid residence hall');
    }

    residence.zone = zone.name;

    return residence;
  }

  private _validateAccommodations(accommodations: string) {
    if (accommodations === 'true' || accommodations === 'false') {
      return accommodations === 'true';
    }

    throw new Error('Invalid accommodations value');
  }
}

