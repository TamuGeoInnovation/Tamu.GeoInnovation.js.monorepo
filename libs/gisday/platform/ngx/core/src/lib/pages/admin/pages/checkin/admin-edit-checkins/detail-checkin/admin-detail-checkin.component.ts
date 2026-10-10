import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  private fb1: FormBuilder;
  private route1: ActivatedRoute;
  private checkinService: CheckinService;

  constructor() {
    const fb1 = inject(FormBuilder);
    const route1 = inject(ActivatedRoute);
    const checkinService = inject(CheckinService);

    super(fb1, route1, checkinService);

    this.fb1 = fb1;
    this.route1 = route1;
    this.checkinService = checkinService;
  }

  public ngOnInit() {
    this.form = formExporter();
  }
}
