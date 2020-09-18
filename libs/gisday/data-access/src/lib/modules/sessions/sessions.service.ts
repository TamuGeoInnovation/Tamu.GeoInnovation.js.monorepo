import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { Event } from '@tamu-gisc/gisday/nest';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + '/event';
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
