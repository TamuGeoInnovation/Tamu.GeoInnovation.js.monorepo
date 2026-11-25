import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { UniversityAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-university-edit',
  templateUrl: './university-edit.component.html',
  styleUrls: ['./university-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [UniversityAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => UniversityEditComponent)]
})
export class UniversityEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(UniversityAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
