import { Component, inject } from '@angular/core';

import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-checkins',
  templateUrl: './admin-view-checkins.component.html',
  styleUrls: ['./admin-view-checkins.component.scss']
})
export class AdminViewCheckinsComponent extends BaseAdminViewComponent<CheckIn> {
  public readonly entityService = inject(CheckinService);
}
