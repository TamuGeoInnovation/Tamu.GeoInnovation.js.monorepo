import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AccountDetailsService } from '../details/account-details.service';

@Injectable({
  providedIn: 'root'
})
export class AccountPreferencesService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient, private details: AccountDetailsService) {
    this.resource = `${this.env.value('api_url')}userServices/updateNotificationData`;
  }

  public getNotificationPreferences(): Observable<IAccountPreferences> {
    return this.details.getDetails().pipe(
      switchMap((details) => {
        return of({
          NewsUpdates: JSON.parse(details.NotifyNewsUpdates.toLowerCase()),
          ServiceUpdates: JSON.parse(details.NotifyServiceUpdates.toLowerCase()),
          ServiceOutages: JSON.parse(details.NotifyServiceOutages.toLowerCase())
        });
      })
    );
  }

  public updateNotificationPreferences(prefs: IAccountPreferenceNotification) {
    const settings: Array<Observable<unknown>> = Object.entries(prefs)
      .map(([type, value]) => {
        return {
          NotificationType: type,
          ShouldNotify: value
        };
      })
      .map((setting: IAccountPreferenceNotification) => {
        return this.http.get(this.resource, {
          withCredentials: true,
          params: {
            NotificationType: `${setting.NotificationType}`,
            ShouldNotify: `${setting.ShouldNotify}`
          }
        });
      });

    return forkJoin([...settings]);
  }
}

export interface IAccountPreferences {
  NewsUpdates: boolean;
  ServiceUpdates: boolean;
  ServiceOutages: boolean;
}

export interface IAccountPreferenceNotification {
  NotificationType: string;
  ShouldNotify: string;
}
