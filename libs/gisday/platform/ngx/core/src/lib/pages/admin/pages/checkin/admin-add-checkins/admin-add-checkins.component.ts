import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    userGuid: new FormControl(''),
    eventGuid: new FormControl('')
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-checkins',
  templateUrl: './admin-add-checkins.component.html',
  styleUrls: ['./admin-add-checkins.component.scss']
})
export class AdminAddCheckinsComponent extends BaseAdminAddComponent<CheckIn> implements OnInit {
  constructor(private fb1: FormBuilder, private checkinService: CheckinService) {
    super(fb1, checkinService);
  }

  public ngOnInit() {
    this.form = formExporter();
  }
}
