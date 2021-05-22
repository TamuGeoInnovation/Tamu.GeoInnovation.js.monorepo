import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CheckinService } from '@tamu-gisc/gisday/data-access';
import { CheckIn } from '@tamu-gisc/gisday/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  userGuid: [''],
  eventGuid: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-checkins',
  templateUrl: './admin-add-checkins.component.html',
  styleUrls: ['./admin-add-checkins.component.scss']
})
export class AdminAddCheckinsComponent extends BaseAdminAddComponent<CheckIn> {
  constructor(private fb1: FormBuilder, private checkinService: CheckinService) {
    super(fb1, checkinService);
    this.formGroup = formConfig;
  }
}
