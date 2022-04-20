import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../admin-add-sponsors/admin-add-sponsors.component';

@Component({
  selector: 'tamu-gisc-admin-detail-sponsor',
  templateUrl: './admin-detail-sponsor.component.html',
  styleUrls: ['./admin-detail-sponsor.component.scss']
})
export class AdminDetailSponsorComponent extends BaseAdminDetailComponent<Sponsor> implements OnInit {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private sponsorService: SponsorService) {
    super(fb1, route1, sponsorService);
    this.form = formExporter();
  }

  public ngOnInit() {
    super.ngOnInit();
  }
}
