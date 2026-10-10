import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SUBMISSION_REVIEW_STATUS } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { SubmissionReviewStatusPipe } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-research-competition-list',
  templateUrl: './research-competition-list.component.html',
  styleUrls: ['./research-competition-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    SelectComponent,
    CheckboxComponent,
    RouterLink,
    NgClass,
    AsyncPipe,
    TitleCasePipe,
    ExistsPipe,
    SubmissionReviewStatusPipe
  ]
})
export class ResearchCompetitionListComponent extends BaseAdminListComponent<Submission> {
  protected readonly entityService = inject(UserSubmissionsService);

  public SubmissionReviewStatus = SUBMISSION_REVIEW_STATUS;
}
