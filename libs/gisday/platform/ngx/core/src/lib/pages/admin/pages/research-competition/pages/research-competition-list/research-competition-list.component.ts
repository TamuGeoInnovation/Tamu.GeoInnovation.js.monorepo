import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
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
  private readonly submissionService: UserSubmissionsService;
  private readonly ss: SeasonService;
  private readonly ar: ActivatedRoute;
  private readonly rt: Router;
  private readonly ms: ModalService;
  private readonly ns: NotificationService;

  public SubmissionReviewStatus = SUBMISSION_REVIEW_STATUS;

  constructor() {
    const submissionService = inject(UserSubmissionsService);
    const ss = inject(SeasonService);
    const ar = inject(ActivatedRoute);
    const rt = inject(Router);
    const ms = inject(ModalService);
    const ns = inject(NotificationService);

    super(submissionService, ss, ar, rt, ms, ns);

    this.submissionService = submissionService;
    this.ss = ss;
    this.ar = ar;
    this.rt = rt;
    this.ms = ms;
    this.ns = ns;
  }
}
