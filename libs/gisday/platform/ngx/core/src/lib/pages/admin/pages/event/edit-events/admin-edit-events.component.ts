import { Component } from '@angular/core';

import { EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/data-api';

import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-events',
  templateUrl: './admin-edit-events.component.html',
  styleUrls: ['./admin-edit-events.component.scss']
})
export class AdminEditEventsComponent extends BaseAdminEditComponent<Event> {
  constructor(private readonly eventService: EventService) {
    super(eventService);
  }
}
