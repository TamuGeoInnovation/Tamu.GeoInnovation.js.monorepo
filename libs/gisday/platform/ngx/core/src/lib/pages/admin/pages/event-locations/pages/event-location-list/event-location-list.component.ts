import { Component } from '@angular/core';

import { LocationService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EventLocation } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-event-location-list',
  templateUrl: './event-location-list.component.html',
  styleUrls: ['./event-location-list.component.scss']
})
export class EventLocationListComponent extends BaseAdminListComponent<EventLocation> {
  constructor(private readonly eventLocationService: LocationService) {
    super(eventLocationService);
  }
}

