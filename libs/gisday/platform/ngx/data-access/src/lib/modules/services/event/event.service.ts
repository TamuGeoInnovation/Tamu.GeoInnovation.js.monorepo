import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Event, EventAttendanceDto } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseService<Event> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('events');
  }

  public getNumberOfRsvps(eventGuid: string) {
    return this.http1.get<number>(`${this.resource}/${eventGuid}/rsvps`);
  }

  public getEvent(guid: string) {
    return this.http1.get<Partial<Event>>(`${this.resource}/${guid}`);
  }

  public getEventsByDay() {
    return this.http1.get<Partial<EventResponse>>(`${this.resource}/by-day`);
  }

  public getEventAttendance(guid: string) {
    return this.http1.get<EventAttendanceDto>(`${this.resource}/${guid}/attendance`);
  }

  public updateEventAttendance(guid: string, counts: EventAttendanceDto) {
    return this.http1.patch<EventAttendanceDto>(`${this.resource}/${guid}/attendance`, counts);
  }
}

export interface EventResponse {
  day0: Event[];
  day1: Event[];
  day2: Event[];
}
