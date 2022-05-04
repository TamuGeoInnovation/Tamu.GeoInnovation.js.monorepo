import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { RsvpTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    type: new FormControl('')
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-rsvp-type',
  templateUrl: './admin-add-rsvp-type.component.html',
  styleUrls: ['./admin-add-rsvp-type.component.scss']
})
export class AdminAddRsvpTypeComponent extends BaseAdminAddComponent<RsvpType> implements OnInit {
  constructor(private rsvpTypeService: RsvpTypeService) {
    super(rsvpTypeService);
  }

  public ngOnInit() {
    this.form = formExporter();
  }
}
