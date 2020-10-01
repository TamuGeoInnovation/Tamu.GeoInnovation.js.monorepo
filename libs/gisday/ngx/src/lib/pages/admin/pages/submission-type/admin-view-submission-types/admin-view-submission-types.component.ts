import { Component } from '@angular/core';
import { SubmissionTypeService } from '@tamu-gisc/gisday/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-submission-types',
  templateUrl: './admin-view-submission-types.component.html',
  styleUrls: ['./admin-view-submission-types.component.scss']
})
export class AdminViewSubmissionTypesComponent extends BaseAdminViewComponent<SubmissionType, SubmissionTypeService> {
  constructor(private readonly submissionTypeService: SubmissionTypeService) {
    super(submissionTypeService);
  }
}
