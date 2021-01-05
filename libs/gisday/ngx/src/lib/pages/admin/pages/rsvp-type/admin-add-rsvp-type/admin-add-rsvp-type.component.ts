import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { RsvpTypeService } from '@tamu-gisc/gisday/data-access';
import { RsvpType } from '@tamu-gisc/gisday/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  type: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-rsvp-type',
  templateUrl: './admin-add-rsvp-type.component.html',
  styleUrls: ['./admin-add-rsvp-type.component.scss']
})
export class AdminAddRsvpTypeComponent extends BaseAdminAddComponent<RsvpType, RsvpTypeService> {
  constructor(private fb1: FormBuilder, private rsvpTypeService: RsvpTypeService) {
    super(fb1, rsvpTypeService, formConfig);
  }
}
