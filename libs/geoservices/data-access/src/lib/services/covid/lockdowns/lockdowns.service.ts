import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Lockdown, CountyClaim, EntityValue } from '@tamu-gisc/covid/common/entities';

@Injectable({
  providedIn: 'root'
})
export class LockdownsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('covid_api_url') + 'lockdowns';
  }

  public submitLockdown(payload) {
    return this.http.post<Partial<Lockdown>>(this.resource, payload);
  }

  /**
   * Returns the lockdown information for a user by their active claim.
   */
  public getActiveLockdownForEmail(email: string) {
    return this.http.get<Partial<ActiveLockdown>>(`${this.resource}/active/email/${email}`);
  }

  /**
   * Returns the latest lockdown submission for the county.
   *
   * This does not necessarily return a validated entry.
   */
  public getLockdownForCounty(countyFips: number) {
    return this.http.get<Partial<ActiveLockdown>>(`${this.resource}/active/county/${countyFips}`);
  }

  public getAllLockdownsForUser(email: string) {
    return this.http.get<Array<Lockdown>>(`${this.resource}/user/${email}`).pipe(
      map((lockdowns) => {
        return lockdowns.sort((a, b) => {
          return Date.parse((b.created as unknown) as string) - Date.parse((a.created as unknown) as string);
        });
      })
    );
  }

  public getLockdownsAdmin(stateFips?: number | string, countyFips?: number | string, email?: string) {
    return this.http.post<Array<Partial<Lockdown>>>(
      `${this.resource}/admin`,
      { stateFips, countyFips, email },
      {
        withCredentials: true
      }
    );
  }

  public getLockdownInfos(claimGuid: string) {
    return this.http.get<Partial<Lockdown>>(`${this.resource}/admin/lockdown/${claimGuid}`, {
      withCredentials: true
    });
  }

  public getLockdownInfoDetails(infoGuid: string) {
    return this.http.get<ActiveLockdown>(`${this.resource}/info/${infoGuid}`);
  }
}

export interface ActiveLockdown {
  claim: CountyClaim;
  info: {
    phoneNumbers: EntityValue[];
    websites: EntityValue[];
    isLockdown: boolean;
    startDate: string;
    endDate: string;
    protocol: string;
    notes: string;
  };
}
