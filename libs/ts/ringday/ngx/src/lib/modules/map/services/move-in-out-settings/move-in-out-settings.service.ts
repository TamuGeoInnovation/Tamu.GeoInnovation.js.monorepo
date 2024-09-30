import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import {
  MoveDate,
  MoveDates,
  MoveEventType,
  MoveInSettings,
  QueryParamSettings,
  ResidenceHall,
  ResidenceZones
} from '../../../../interfaces/ring-day.interface';
import { RESIDENCES } from '../../../../dictionaries/ring-day.dictionary';

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

  public get queryParamsFromSettings() {
    const settings = this.settings;

    if (!settings) {
      return null;
    }

    return `date=${settings.date}&residence=${settings.residence.Bldg_Number}&accessible=${settings.accessible}`;
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

  /**
   * Returns MoveDates for either move-in or move-out event.
   */
  public getDaysForType(type: MoveEventType) {
    if (this.days && this.days[type] && this.days[type].length > 0) {
      return this.days[type];
    } else {
      console.warn(`No move dates found for ${type} event.`);
      return undefined;
    }
  }

  /**
   * Returns the move-in/out MoveDate object for the provided matching calendar day (find operation)
   */
  public getDateForDay(type: MoveEventType, day: number | string): MoveDate | undefined {
    if (this.days[type]?.length > 0) {
      return this.days[type].find((d) => d.day == day);
    } else {
      console.warn(`No move date for provided '${type}' type and '${day}' day.`);
      return undefined;
    }
  }

  /**
   * Returns the first move in/out MoveDate object or the provided event type.
   */
  public getFirstMoveDate(type: MoveEventType) {
    return this.getDaysForType(type)?.[0];
  }

  /**
   * Accepts a move event type and a MoveDate object and determines the index of the `date` object relative to the
   * event type's MoveDates array.
   */
  public getMoveDateEventDayNumber(type: MoveEventType, date: MoveDate) {
    const dates = this.getDaysForType(type);

    if (dates) {
      return dates.findIndex((d) => d.day == date.day) + 1;
    } else {
      console.warn(`No move dates found for ${type} event.`);
      return undefined;
    }
  }

  public getMoveDateEventDayNumberForSettings() {
    const savedDate = this.getDateForDay('in', parseInt(this.settings.date));

    if (savedDate) {
      return this.getMoveDateEventDayNumber('in', savedDate);
    } else {
      console.warn(`No move date found for settings date.`);
      return undefined;
    }
  }

  /**
   * Returns the move-in/out date as a Date object for the provided MoveDate object.
   *
   * Optionally provide a date object. Settings date will be used if not provided.
   */
  public getMoveDateEventAsDate(type: MoveEventType, date?: MoveDate) {
    const savedDate = this.getDateForDay(type, date ? date.day : parseInt(this.settings.date));

    if (savedDate) {
      return new Date(new Date().getFullYear(), savedDate.month - 1, savedDate.day);
    } else {
      console.warn(`No event day found for provided date.`);
      return undefined;
    }
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
