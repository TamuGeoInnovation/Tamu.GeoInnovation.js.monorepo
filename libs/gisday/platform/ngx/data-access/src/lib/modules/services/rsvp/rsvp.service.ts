import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserRsvp } from '@tamu-gisc/gisday/platform/data-api';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class RsvpService extends BaseService<UserRsvp> {
  private env1: EnvironmentService;
  private readonly http1: HttpClient;

  constructor() {
    const env1 = inject(EnvironmentService);
    const http1 = inject(HttpClient);

    super(env1, http1, 'rsvps');

    this.env1 = env1;
    this.http1 = http1;
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
