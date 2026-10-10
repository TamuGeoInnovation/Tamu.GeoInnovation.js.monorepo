import { Component, OnInit, inject } from '@angular/core';

import { CheckinService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../admin-add-checkins/admin-add-checkins.component';

@Component({
  selector: 'tamu-gisc-detail-checkin',
  templateUrl: './admin-detail-checkin.component.html',
  styleUrls: ['./admin-detail-checkin.component.scss']
})
export class AdminDetailCheckinComponent extends BaseAdminDetailComponent<CheckIn> implements OnInit {
  protected readonly entityService = inject(CheckinService);

  public ngOnInit() {
    this.form = formExporter();
  }
}
