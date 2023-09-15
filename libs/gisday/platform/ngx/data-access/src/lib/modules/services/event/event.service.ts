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
    super(env1, http1, 'event');
  }

  public getNumberOfRsvps(eventGuid: string) {
    return this.http1.get<number>(`${this.resource}/${eventGuid}/rsvps`, {
      headers: this.headers
    });
  }

  public getEvents() {
    return this.http1.get<Array<Partial<Event>>>(`${this.resource}/all`, {
      headers: this.headers
    });
  }

  public getEvent(guid: string) {
    return this.http1.get<Partial<Event>>(`${this.resource}/${guid}`, {
      headers: this.headers
    });
  }

  public getEventsByDay() {
    return this.http1.get<Partial<EventResponse>>(`${this.resource}/by-day`, {
      headers: this.headers
    });
  }

  public createEventFromFormData(data: FormData) {
    return this.http1
      .post(`${this.resource}`, data, {
        headers: this.headers
      })
      .subscribe((result) => {
        console.log(result);
      });
  }
}

export interface EventResponse {
  day0: Event[];
  day1: Event[];
  day2: Event[];
}
