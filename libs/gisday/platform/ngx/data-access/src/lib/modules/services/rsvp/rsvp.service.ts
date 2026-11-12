import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RsvpDashboard, RsvpDashboardPerson, UserRsvp } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class RsvpService extends BaseService<UserRsvp> {
  private readonly http1 = inject(HttpClient);

  constructor() {
    super('rsvps');
  }

  public createRsvp(eventGuid: string) {
    return this.http1.post(`${this.resource}/`, {
      eventGuid: eventGuid
    });
  }

  public getRsvpsForSignedInUser() {
    return this.http1.get<Array<UserRsvp>>(`${this.resource}/user/`);
  }

  public getUserRsvpForEvent(eventGuid: string) {
    return this.http1.get<UserRsvp>(`${this.resource}/user/event/${eventGuid}`);
  }

  /** The admin RSVP dashboard for a season: each event counted by person type, and when each RSVP was made (#2878). */
  public getDashboardForSeason(seasonGuid: string) {
    return this.http1.get<RsvpDashboard>(`${this.resource}/dashboard/season/${seasonGuid}`);
  }

  /** The people who RSVP'd for one event, for the dashboard's expanded row and its CSV (#2878). */
  public getDashboardForEvent(eventGuid: string) {
    return this.http1.get<Array<RsvpDashboardPerson>>(`${this.resource}/dashboard/event/${eventGuid}`);
  }
}
