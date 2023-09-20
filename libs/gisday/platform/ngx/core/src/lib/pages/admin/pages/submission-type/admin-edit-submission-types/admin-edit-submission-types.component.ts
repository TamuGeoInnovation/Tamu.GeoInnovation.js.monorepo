import { Component } from '@angular/core';

import { SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-submission-types',
  templateUrl: './admin-edit-submission-types.component.html',
  styleUrls: ['./admin-edit-submission-types.component.scss']
})
export class AdminEditSubmissionTypesComponent extends BaseAdminListComponent<SubmissionType> {
  constructor(private readonly submissionTypeService: SubmissionTypeService) {
    super(submissionTypeService);
  }
}
