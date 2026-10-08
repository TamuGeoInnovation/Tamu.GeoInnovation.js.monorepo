import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../admin-add-submission-types/admin-add-submission-types.component';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
    selector: 'tamu-gisc-admin-detail-session-type',
    templateUrl: './admin-detail-session-type.component.html',
    styleUrls: ['./admin-detail-session-type.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent]
})
export class AdminDetailSessionTypeComponent extends BaseAdminDetailComponent<SubmissionType> implements OnInit {
  constructor(
    private fb1: UntypedFormBuilder,
    private route1: ActivatedRoute,
    private submissionTypeService: SubmissionTypeService
  ) {
    super(fb1, route1, submissionTypeService);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.form = formExporter();
  }
}
