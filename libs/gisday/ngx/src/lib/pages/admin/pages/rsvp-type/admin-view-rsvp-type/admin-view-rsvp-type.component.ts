import { Component } from '@angular/core';

import { RsvpTypeService } from '@tamu-gisc/gisday/data-access';
import { RsvpType } from '@tamu-gisc/gisday/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-rsvp-type',
  templateUrl: './admin-view-rsvp-type.component.html',
  styleUrls: ['./admin-view-rsvp-type.component.scss']
})
export class AdminViewRsvpTypeComponent extends BaseAdminViewComponent<RsvpType, RsvpTypeService> {
  constructor(private readonly rsvpTypeService: RsvpTypeService) {
    super(rsvpTypeService);
  }
}
