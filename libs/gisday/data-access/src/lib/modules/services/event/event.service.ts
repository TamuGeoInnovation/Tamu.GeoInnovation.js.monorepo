import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Event } from '@tamu-gisc/gisday/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseService<Event> {
  public withCredentials = false;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'event');
  }

  public getNumberOfRsvps(eventGuid: string) {
    return this.http1.get<number>(`${this.resource}/${eventGuid}/rsvps`, {
      withCredentials: false
    });
  }

  public getEventsByDay() {
    return this.http1.get<Partial<EventResponse>>(`${this.resource}/by-day`, {
      withCredentials: false
    });
  }
}

export interface EventResponse {
  0: Event[];
  1: Event[];
  2: Event[];
}
