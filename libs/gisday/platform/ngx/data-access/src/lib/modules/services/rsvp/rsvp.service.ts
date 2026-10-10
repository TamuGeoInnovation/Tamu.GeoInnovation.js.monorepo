import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserRsvp } from '@tamu-gisc/gisday/platform/data-api';

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
}
