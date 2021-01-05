import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { EventService } from '@tamu-gisc/gisday/data-access';
import { Event } from '@tamu-gisc/gisday/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  name: [''],
  locationBuilding: [''],
  locationRoom: [''],
  startTime: [''],
  endTime: [''],
  presentationType: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-events',
  templateUrl: './admin-add-events.component.html',
  styleUrls: ['./admin-add-events.component.scss']
})
export class AdminAddEventsComponent extends BaseAdminAddComponent<Event, EventService> {
  constructor(private fb1: FormBuilder, private eventService: EventService) {
    super(fb1, eventService, formConfig);
  }
}
