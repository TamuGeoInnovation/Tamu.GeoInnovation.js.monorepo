import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

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
export class AdminAddSubmissionTypesComponent extends BaseAdminAddComponent<SubmissionType> implements OnInit {
  constructor(private submissionTypeService: SubmissionTypeService) {
    super(submissionTypeService);
  }

  public ngOnInit() {
    this.form = formExporter();
  }
}
