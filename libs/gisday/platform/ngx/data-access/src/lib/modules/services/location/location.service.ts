import { Injectable } from '@angular/core';

import { EventLocation } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends BaseService<EventLocation> {
  public resource: string;

  constructor() {
    super('event-locations');
  }
}
