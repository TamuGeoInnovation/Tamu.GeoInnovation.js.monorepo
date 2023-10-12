import { Component } from '@angular/core';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss']
})
export class SponsorListComponent extends BaseAdminListComponent<Sponsor> {
  constructor(private readonly sponsorService: SponsorService) {
    super(sponsorService);
  }
}

