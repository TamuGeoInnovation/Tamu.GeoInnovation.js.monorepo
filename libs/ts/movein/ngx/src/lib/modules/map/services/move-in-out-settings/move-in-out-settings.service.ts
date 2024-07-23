import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { MoveDates, MoveInSettings } from '../../../../interfaces/move-in-out.interface';

@Injectable({
  providedIn: 'root'
})
export class MoveInOutSettingsService {
  private _settingsPrimaryKey = 'aggiemap-movein';

  public days: MoveDates = this.env.value('MoveInOutDates', false);

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
}

