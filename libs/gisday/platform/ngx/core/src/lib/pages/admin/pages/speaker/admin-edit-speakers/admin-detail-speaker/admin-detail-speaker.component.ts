import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';

// TODO: Fix this -Aaron (1/5/2021)
export const formConfig = {
  guid: [''],
  firstName: [''],
  lastName: [''],
  email: [''],
  organization: [''],
  graduationYear: [''],
  degree: [''],
  program: [''],
  affiliation: [''],
  description: [''],
  socialMedia: [''],
  university: [''],
  file: ['']
};

@Component({
  selector: 'tamu-gisc-admin-detail-speaker',
  templateUrl: './admin-detail-speaker.component.html',
  styleUrls: ['./admin-detail-speaker.component.scss']
})
export class AdminDetailSpeakerComponent extends BaseAdminDetailComponent<Speaker> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private speakerService: SpeakerService) {
    super(fb1, route1, speakerService);
    this.formGroup = formConfig;
  }

  public submitNewEntity() {
    const form = this.form.getRawValue();
    const data: FormData = new FormData();
    const formKeys = Object.keys(form);
    formKeys.forEach((key) => {
      data.append(key, form[key]);
    });
    this.speakerService.insertSpeakerInfo(data);
  }
}
