import { Component } from '@angular/core';

import { RsvpTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-rsvp-type',
  templateUrl: './admin-edit-rsvp-type.component.html',
  styleUrls: ['./admin-edit-rsvp-type.component.scss']
})
export class AdminEditRsvpTypeComponent extends BaseAdminListComponent<RsvpType> {
  constructor(private readonly rsvpTypeService: RsvpTypeService) {
    super(rsvpTypeService);
  }
}
