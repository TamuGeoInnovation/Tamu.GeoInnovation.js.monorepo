import { Component } from '@angular/core';

import { SubmissionTypeService } from '@tamu-gisc/gisday/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/data-api';
import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-submission-types',
  templateUrl: './admin-edit-submission-types.component.html',
  styleUrls: ['./admin-edit-submission-types.component.scss']
})
export class AdminEditSubmissionTypesComponent extends BaseAdminEditComponent<SubmissionType, SubmissionTypeService> {
  constructor(private readonly submissionTypeService: SubmissionTypeService) {
    super(submissionTypeService);
  }
}
