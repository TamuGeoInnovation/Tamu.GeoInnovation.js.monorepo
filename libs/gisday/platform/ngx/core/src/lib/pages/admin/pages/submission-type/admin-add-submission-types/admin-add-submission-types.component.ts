import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  type: ['']
};

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    type: new FormControl('')
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-submission-types',
  templateUrl: './admin-add-submission-types.component.html',
  styleUrls: ['./admin-add-submission-types.component.scss']
})
export class AdminAddSubmissionTypesComponent extends BaseAdminAddComponent<SubmissionType> {
  constructor(private fb1: FormBuilder, private submissionTypeService: SubmissionTypeService) {
    super(fb1, submissionTypeService);
    this.form = formExporter();
  }
}
