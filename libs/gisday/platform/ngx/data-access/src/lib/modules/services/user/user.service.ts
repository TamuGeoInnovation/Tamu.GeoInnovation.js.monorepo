import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '@auth0/auth0-angular';

import { GisDayAppMetadata } from '@tamu-gisc/gisday/platform/data-api';
import type { AccountDashboard, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';
import { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('users');
  }

  public getUsers() {
    return this.http1.get<Array<Auth0UserProfile>>(`${this.resource}`);
  }

  public getUser(userId: string) {
    return this.http1.get<Array<Auth0UserProfile>>(`${this.resource}/${userId}`);
  }

  public getUserMetadata(userId: string) {
    return this.http1.get<GisDayAppMetadata>(`${this.resource}/${userId}/metadata`);
  }

  public updateUserMetadata(userId: string, metadata: Partial<GisDayAppMetadata>) {
    return this.http1.patch<Partial<GisDayAppMetadata>>(`${this.resource}/${userId}/metadata`, metadata);
  }

  /** A season's accounts for the User accounts dashboard (#2892): counts only. */
  public getDashboardForSeason(seasonGuid: string) {
    return this.http1.get<AccountDashboard>(`${this.resource}/dashboard/season/${seasonGuid}`);
  }

  /** The people of one of its rows, by the row's key (a university or employer's name), for the opened row and its CSV. */
  public getDashboardRow(seasonGuid: string, key: string) {
    return this.http1.get<Array<RsvpDashboardPerson>>(`${this.resource}/dashboard/season/${seasonGuid}/row/${encodeURIComponent(key)}`);
  }
}
