import { Injectable } from '@angular/core';

import { EventBroadcast } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService extends BaseService<EventBroadcast> {
  public resource: string;

  constructor() {
    super('event-broadcasts');
  }
}
