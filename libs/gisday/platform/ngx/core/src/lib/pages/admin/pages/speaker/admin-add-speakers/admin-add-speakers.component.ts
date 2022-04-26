import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker, University } from '@tamu-gisc/gisday/platform/data-api';

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
export class AdminAddSpeakersComponent extends BaseAdminAddComponent<Speaker> {
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

  public submitNewEntity() {
    const form = this.form.getRawValue();
    const data: FormData = new FormData();
    const parentFormKeys = Object.keys(form);

    const appendValuesToFormData = (keys, childProp?: string) => {
      keys.forEach((key) => {
        if (form[key]) {
          if (typeof form[key] == 'object') {
            appendValuesToFormData(Object.keys(form[key]), key);
          } else {
            data.append(key, form[key]);
          }
        } else if (childProp) {
          if (form[childProp][key]) {
            if (typeof form[key] == 'object') {
              appendValuesToFormData(Object.keys(form[key]), key);
            } else {
              data.append(key, form[childProp][key]);
            }
          }
        }
      });
    };
    appendValuesToFormData(parentFormKeys);

    this.speakerService.insertSpeakerInfo(data);
  }
}
