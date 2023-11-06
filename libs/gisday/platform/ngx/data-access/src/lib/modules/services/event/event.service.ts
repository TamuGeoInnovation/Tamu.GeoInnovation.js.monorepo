import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseService<Event> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'events');
  }

  public getNumberOfRsvps(eventGuid: string) {
    return this.http1.get<number>(`${this.resource}/${eventGuid}/rsvps`);
  }

  public getEvents() {
    return this.http1.get<Array<Partial<Event>>>(`${this.resource}/`);
  }

  public getEvent(guid: string) {
    return this.http1.get<Partial<Event>>(`${this.resource}/${guid}`);
  }

  public getEventsByDay() {
    return this.http1.get<Partial<EventResponse>>(`${this.resource}/by-day`);
  }
}

export interface EventResponse {
  day0: Event[];
  day1: Event[];
  day2: Event[];
}
