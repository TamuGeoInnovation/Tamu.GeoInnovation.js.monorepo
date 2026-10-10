import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  protected readonly entityService = inject(SubmissionTypeService);

  public ngOnInit() {
    super.ngOnInit();

    this.form = formExporter();
  }
}
