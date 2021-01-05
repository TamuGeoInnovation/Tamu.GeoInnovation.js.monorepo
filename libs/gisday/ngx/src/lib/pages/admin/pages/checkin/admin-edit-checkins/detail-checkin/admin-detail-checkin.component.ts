import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CheckinService } from '@tamu-gisc/gisday/data-access';
import { CheckIn } from '@tamu-gisc/gisday/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-checkins/admin-add-checkins.component';

@Component({
  selector: 'tamu-gisc-detail-checkin',
  templateUrl: './admin-detail-checkin.component.html',
  styleUrls: ['./admin-detail-checkin.component.scss']
})
export class AdminDetailCheckinComponent extends BaseAdminDetailComponent<CheckIn, CheckinService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private checkinService: CheckinService) {
    super(fb1, route1, checkinService, formConfig);
  }
}
