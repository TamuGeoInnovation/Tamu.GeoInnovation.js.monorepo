import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SubmissionTypeService } from '@tamu-gisc/gisday/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/data-api';
import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-submission-types/admin-add-submission-types.component';

@Component({
  selector: 'tamu-gisc-admin-detail-session-type',
  templateUrl: './admin-detail-session-type.component.html',
  styleUrls: ['./admin-detail-session-type.component.scss']
})
export class AdminDetailSessionTypeComponent extends BaseAdminDetailComponent<SubmissionType, SubmissionTypeService> {
  constructor(
    private fb1: FormBuilder,
    private route1: ActivatedRoute,
    private submissionTypeService: SubmissionTypeService
  ) {
    super(fb1, route1, submissionTypeService, formConfig);
  }
}
