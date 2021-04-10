import { Component } from '@angular/core';

import { EventService } from '@tamu-gisc/gisday/data-access';
import { Event } from '@tamu-gisc/gisday/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-events',
  templateUrl: './admin-view-events.component.html',
  styleUrls: ['./admin-view-events.component.scss']
})
export class AdminViewEventsComponent extends BaseAdminViewComponent<Event> {
  constructor(private readonly eventService: EventService) {
    super(eventService);
  }
}
