import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SubmissionTypeService } from '@tamu-gisc/gisday/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/data-api';
import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  type: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-submission-types',
  templateUrl: './admin-add-submission-types.component.html',
  styleUrls: ['./admin-add-submission-types.component.scss']
})
export class AdminAddSubmissionTypesComponent extends BaseAdminAddComponent<SubmissionType, SubmissionTypeService> {
  constructor(private fb1: FormBuilder, private submissionTypeService: SubmissionTypeService) {
    super(fb1, submissionTypeService, formConfig);
  }
}
