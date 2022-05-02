import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker, University } from '@tamu-gisc/gisday/platform/data-api';
import { formToFormData } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    organization: new FormControl(''),
    speakerInfo: new FormGroup({
      graduationYear: new FormControl(''),
      degree: new FormControl(''),
      program: new FormControl(''),
      affiliation: new FormControl(''),
      description: new FormControl(''),
      socialMedia: new FormControl(''),
      file: new FormControl(''),
      university: new FormControl('')
    })
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-speakers',
  templateUrl: './admin-add-speakers.component.html',
  styleUrls: ['./admin-add-speakers.component.scss']
})
export class AdminAddSpeakersComponent extends BaseAdminAddComponent<Speaker> implements OnInit {
  public $universities: Observable<Array<Partial<University>>>;

  constructor(
    private fb1: FormBuilder,
    private speakerService: SpeakerService,
    private universityService: UniversityService
  ) {
    super(fb1, speakerService);

    this.$universities = this.universityService.getEntities();

    this.form = formExporter();
  }

  public ngOnInit() {
    this.form = formExporter();
  }

  public submitNewEntity() {
    const formData = formToFormData(this.form);

    this.speakerService.insertSpeakerInfo(formData);
  }
}
