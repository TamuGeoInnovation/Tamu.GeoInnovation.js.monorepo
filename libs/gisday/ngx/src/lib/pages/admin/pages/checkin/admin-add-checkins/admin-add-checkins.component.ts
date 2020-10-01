import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
export class AdminAddCheckinsComponent extends BaseAdminAddComponent<CheckIn, CheckinService> {
  constructor(private fb1: FormBuilder, private checkinService: CheckinService) {
    super(fb1, checkinService, formConfig);
  }
}
