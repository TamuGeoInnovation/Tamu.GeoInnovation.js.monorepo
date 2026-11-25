import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Event, EventBroadcast } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService extends BaseService<EventBroadcast> {
  private readonly http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('event-broadcasts');
  }

  /** The sessions that use the broadcast, hidden ones too, for its admin page (#3032). */
  public getSessions(guid: string) {
    return this.http1.get<Array<Partial<Event>>>(`${this.resource}/${guid}/sessions`);
  }
}
