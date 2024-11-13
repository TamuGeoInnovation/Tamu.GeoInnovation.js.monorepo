import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SUBMISSION_REVIEW_STATUS } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-research-competition-list',
  templateUrl: './research-competition-list.component.html',
  styleUrls: ['./research-competition-list.component.scss']
})
export class ResearchCompetitionListComponent extends BaseAdminListComponent<Submission> {
  public SubmissionReviewStatus = SUBMISSION_REVIEW_STATUS;

  constructor(
    private readonly submissionService: UserSubmissionsService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(submissionService, ss, ar, rt, ms, ns);
  }
}
