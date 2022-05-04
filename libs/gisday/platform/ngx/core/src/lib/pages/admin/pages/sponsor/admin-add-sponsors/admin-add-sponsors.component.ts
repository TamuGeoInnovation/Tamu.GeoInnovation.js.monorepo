import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    name: new FormControl(''),
    website: new FormControl(''),
    logoUrl: new FormControl(''),
    contactEmail: new FormControl(''),
    description: new FormControl(''),
    sponsorshipLevel: new FormControl('')
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-sponsors',
  templateUrl: './admin-add-sponsors.component.html',
  styleUrls: ['./admin-add-sponsors.component.scss']
})
export class AdminAddSponsorsComponent extends BaseAdminAddComponent<Sponsor> implements OnInit {
  constructor(private sponsorService: SponsorService) {
    super(sponsorService);
  }

  public ngOnInit() {
    this.form = formExporter();
  }
}
