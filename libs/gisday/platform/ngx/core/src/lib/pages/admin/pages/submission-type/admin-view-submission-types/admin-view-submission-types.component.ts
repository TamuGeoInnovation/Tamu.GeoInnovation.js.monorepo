import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-admin-view-submission-types',
  templateUrl: './admin-view-submission-types.component.html',
  styleUrls: ['./admin-view-submission-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe, DatePipe]
})
export class AdminViewSubmissionTypesComponent extends BaseAdminViewComponent<SubmissionType> {
  private readonly submissionTypeService: SubmissionTypeService;

  constructor() {
    const submissionTypeService = inject(SubmissionTypeService);

    super(submissionTypeService);

    this.submissionTypeService = submissionTypeService;
  }
}
