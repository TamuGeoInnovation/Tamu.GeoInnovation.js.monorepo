import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseService<Event> {
  public withCredentials = false;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient, public oidcSecurityService: OidcSecurityService) {
    super(env1, http1, oidcSecurityService, 'event');
  }

  public getNumberOfRsvps(eventGuid: string) {
    return this.http1.get<number>(`${this.resource}/${eventGuid}/rsvps`, {
      withCredentials: false
    });
  }

  public getEventsByDay() {
    const accessToken = this.oidcSecurityService.getAccessToken();
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + accessToken
      })
    };
    return this.http1.get<Partial<EventResponse>>(`${this.resource}/by-day`, httpOptions);
  }
}

export interface EventResponse {
  day0: Event[];
  day1: Event[];
  day2: Event[];
}
