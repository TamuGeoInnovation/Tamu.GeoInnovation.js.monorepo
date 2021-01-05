import { Component } from '@angular/core';

import { CheckinService } from '@tamu-gisc/gisday/data-access';
import { CheckIn } from '@tamu-gisc/gisday/data-api';

import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-checkins',
  templateUrl: './admin-edit-checkins.component.html',
  styleUrls: ['./admin-edit-checkins.component.scss']
})
export class AdminEditCheckinsComponent extends BaseAdminEditComponent<CheckIn, CheckinService> {
  constructor(private readonly checkinService: CheckinService) {
    super(checkinService);
  }
}
