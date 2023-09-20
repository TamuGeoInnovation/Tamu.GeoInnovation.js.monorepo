import { Component } from '@angular/core';

import { EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-events',
  templateUrl: './admin-edit-events.component.html',
  styleUrls: ['./admin-edit-events.component.scss']
})
export class AdminEditEventsComponent extends BaseAdminListComponent<Event> {
  constructor(private readonly eventService: EventService) {
    super(eventService);
  }
}
