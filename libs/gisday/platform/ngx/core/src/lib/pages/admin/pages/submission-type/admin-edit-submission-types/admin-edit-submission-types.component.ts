import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SeasonService, SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-submission-types',
  templateUrl: './admin-edit-submission-types.component.html',
  styleUrls: ['./admin-edit-submission-types.component.scss']
})
export class AdminEditSubmissionTypesComponent extends BaseAdminListComponent<SubmissionType> {
  constructor(
    private readonly submissionTypeService: SubmissionTypeService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(submissionTypeService, ss, ar, rt, ms, ns);
  }
}
