import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Event, Tag } from '@tamu-gisc/gisday/data-api';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  public resource: string;
  public tagResource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/event';
    this.tagResource = this.env.value('api_url') + '/tag';
  }

  public getNumberOfRsvps(eventGuid: string) {
    return this.http.get<number>(`${this.resource}/${eventGuid}/rsvps`, {
      withCredentials: false
    });
  }

  public getEvent(guid: string) {
    return this.http.get<Partial<Event>>(`${this.resource}/${guid}`, {
      withCredentials: false
    });
  }

  public getEvents() {
    return this.http.get<Array<Partial<Event>>>(`${this.resource}/all`, {
      withCredentials: false
    });
  }

  public getEventsByDay() {
    return this.http.get<Partial<EventResponse>>(`${this.resource}/by-day`, {
      withCredentials: false
    });
  }

  public getTags() {
    return this.http.get<Array<Partial<Tag>>>(`${this.tagResource}/all`, {
      withCredentials: false
    });
  }

  public updateEvent(updatedEvent: Partial<Event>) {
    return this.http.patch<Partial<Event>>(`${this.resource}/update`, updatedEvent, {
      withCredentials: true
    });
  }

  public createEvent(newEvent: Partial<Event>) {
    return this.http
      .post<Partial<Event>>(this.resource, newEvent, {
        withCredentials: true
      })
      .subscribe((newestEvent) => {
        console.log('Added event', newestEvent);
      });
  }

  public deleteEvent(event: Event) {
    return this.http.delete<Partial<Event>>(`${this.resource}/delete/${event.guid}`, {
      withCredentials: true
    });
  }
}

export interface EventResponse {
  0: Event[];
  1: Event[];
  2: Event[];
}
