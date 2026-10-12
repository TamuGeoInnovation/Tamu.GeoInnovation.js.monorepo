import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';

import { SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

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
  protected readonly entityService = inject(SubmissionTypeService);
}
