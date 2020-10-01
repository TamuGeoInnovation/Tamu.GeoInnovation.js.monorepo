import { Component } from '@angular/core';
import { SponsorService } from '@tamu-gisc/gisday/data-access';
import { Sponsor } from '@tamu-gisc/gisday/data-api';
import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-sponsors',
  templateUrl: './admin-view-sponsors.component.html',
  styleUrls: ['./admin-view-sponsors.component.scss']
})
export class AdminViewSponsorsComponent extends BaseAdminViewComponent<Sponsor, SponsorService> {
  constructor(private readonly sponsorService: SponsorService) {
    super(sponsorService);
  }
}
