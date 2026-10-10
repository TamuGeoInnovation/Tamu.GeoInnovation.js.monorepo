import { Component, inject } from '@angular/core';

import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-checkins',
  templateUrl: './admin-edit-checkins.component.html',
  styleUrls: ['./admin-edit-checkins.component.scss']
})
export class AdminEditCheckinsComponent extends BaseAdminListComponent<CheckIn> {
  private readonly checkinService: CheckinService;

  constructor() {
    const checkinService = inject(CheckinService);

    super(checkinService);

    this.checkinService = checkinService;
  }
}
