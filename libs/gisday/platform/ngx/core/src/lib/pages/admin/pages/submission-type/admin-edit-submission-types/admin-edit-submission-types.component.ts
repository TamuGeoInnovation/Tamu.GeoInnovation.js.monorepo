import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink } from '@angular/router';

import { SeasonService, SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-admin-edit-submission-types',
  templateUrl: './admin-edit-submission-types.component.html',
  styleUrls: ['./admin-edit-submission-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLinkActive, RouterLink, AsyncPipe, DatePipe]
})
export class AdminEditSubmissionTypesComponent extends BaseAdminListComponent<SubmissionType> {
  private readonly submissionTypeService: SubmissionTypeService;
  private readonly ss: SeasonService;
  private readonly ar: ActivatedRoute;
  private readonly rt: Router;
  private readonly ms: ModalService;
  private readonly ns: NotificationService;

  constructor() {
    const submissionTypeService = inject(SubmissionTypeService);
    const ss = inject(SeasonService);
    const ar = inject(ActivatedRoute);
    const rt = inject(Router);
    const ms = inject(ModalService);
    const ns = inject(NotificationService);

    super(submissionTypeService, ss, ar, rt, ms, ns);

    this.submissionTypeService = submissionTypeService;
    this.ss = ss;
    this.ar = ar;
    this.rt = rt;
    this.ms = ms;
    this.ns = ns;
  }
}
