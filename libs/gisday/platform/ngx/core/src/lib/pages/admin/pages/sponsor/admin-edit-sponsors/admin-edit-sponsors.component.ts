import { Component } from '@angular/core';

import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-sponsors',
  templateUrl: './admin-edit-sponsors.component.html',
  styleUrls: ['./admin-edit-sponsors.component.scss']
})
export class AdminEditSponsorsComponent extends BaseAdminListComponent<Sponsor> {
  constructor(private readonly sponsorService: SponsorService) {
    super(sponsorService);
  }
}
