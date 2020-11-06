import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/data-access';
import { Speaker, University } from '@tamu-gisc/gisday/data-api';
import { Observable } from 'rxjs';
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
export class AdminAddSpeakersComponent extends BaseAdminAddComponent<Speaker, SpeakerService> {
  public $universities: Observable<Array<Partial<University>>>;
  constructor(
    private fb1: FormBuilder,
    private speakerService: SpeakerService,
    private universityService: UniversityService
  ) {
    super(fb1, speakerService, formConfig);
    this.$universities = this.universityService.getEntities();
  }

  public submitNewEntity() {
    const form = this.form.getRawValue();
    const data: FormData = new FormData();
    const formKeys = Object.keys(form);
    formKeys.forEach((key) => {
      data.append(key, form[key]);
    });

    // data.append('file', this.form.get('file').value, 'file');
    this.speakerService.insertSpeakerInfo(data);
  }
}
