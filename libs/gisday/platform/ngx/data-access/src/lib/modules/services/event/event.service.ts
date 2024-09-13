import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Event, EventAttendanceDto } from '@tamu-gisc/gisday/platform/data-api';

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

  /**
   * Retrieves events for the active season if no `seasonGuid` is provided.
   */
  public getEvents(seasonGuid?: string) {
    return this.http1.get<Array<Partial<Event>>>(`${this.resource}/`, { params: { seasonGuid } });
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
