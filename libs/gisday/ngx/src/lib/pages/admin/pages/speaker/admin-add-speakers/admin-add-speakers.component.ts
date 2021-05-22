import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/data-access';
import { Speaker, University } from '@tamu-gisc/gisday/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

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
  selector: 'tamu-gisc-admin-add-speakers',
  templateUrl: './admin-add-speakers.component.html',
  styleUrls: ['./admin-add-speakers.component.scss']
})
export class AdminAddSpeakersComponent extends BaseAdminAddComponent<Speaker> {
  public $universities: Observable<Array<Partial<University>>>;
  constructor(
    private fb1: FormBuilder,
    private speakerService: SpeakerService,
    private universityService: UniversityService
  ) {
    super(fb1, speakerService);
    this.$universities = this.universityService.getEntities();
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
