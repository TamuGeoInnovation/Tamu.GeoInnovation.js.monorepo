import { Component } from '@angular/core';

import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Sponsor } from '@tamu-gisc/gisday/data-api';

import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-sponsors',
  templateUrl: './admin-edit-sponsors.component.html',
  styleUrls: ['./admin-edit-sponsors.component.scss']
})
export class AdminEditSponsorsComponent extends BaseAdminEditComponent<Sponsor> {
  constructor(private readonly sponsorService: SponsorService) {
    super(sponsorService);
  }
}
