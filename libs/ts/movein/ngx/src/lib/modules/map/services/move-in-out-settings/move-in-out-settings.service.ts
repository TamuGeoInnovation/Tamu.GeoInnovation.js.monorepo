import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveDates, MoveInSettings, ResidenceHall, ResidenceZones } from '../../../../interfaces/move-in-out.interface';
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
}

