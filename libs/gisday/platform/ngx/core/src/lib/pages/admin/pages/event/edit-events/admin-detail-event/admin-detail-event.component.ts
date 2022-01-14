import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../add-events/admin-add-events.component';

@Component({
  selector: 'tamu-gisc-admin-detail-event',
  templateUrl: './admin-detail-event.component.html',
  styleUrls: ['./admin-detail-event.component.scss']
})
export class AdminDetailEventComponent extends BaseAdminDetailComponent<Event> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private eventService: EventService) {
    super(fb1, route1, eventService);
    this.formGroup = formConfig;
  }
}
