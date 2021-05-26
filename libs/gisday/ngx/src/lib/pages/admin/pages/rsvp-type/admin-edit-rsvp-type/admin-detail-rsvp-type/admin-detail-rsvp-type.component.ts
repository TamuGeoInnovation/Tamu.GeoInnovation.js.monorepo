import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { RsvpTypeService } from '@tamu-gisc/gisday/data-access';
import { RsvpType } from '@tamu-gisc/gisday/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-rsvp-type/admin-add-rsvp-type.component';

@Component({
  selector: 'tamu-gisc-admin-detail-rsvp-type',
  templateUrl: './admin-detail-rsvp-type.component.html',
  styleUrls: ['./admin-detail-rsvp-type.component.scss']
})
export class AdminDetailRsvpTypeComponent extends BaseAdminDetailComponent<RsvpType> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private rsvpTypeService: RsvpTypeService) {
    super(fb1, route1, rsvpTypeService);
    this.formGroup = formConfig;
  }
}
