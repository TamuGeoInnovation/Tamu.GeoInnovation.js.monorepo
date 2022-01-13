import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  name: [''],
  website: [''],
  logoUrl: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-sponsors',
  templateUrl: './admin-add-sponsors.component.html',
  styleUrls: ['./admin-add-sponsors.component.scss']
})
export class AdminAddSponsorsComponent extends BaseAdminAddComponent<Sponsor> {
  constructor(private fb1: FormBuilder, private sponsorService: SponsorService) {
    super(fb1, sponsorService);
    this.formGroup = formConfig;
  }
}
