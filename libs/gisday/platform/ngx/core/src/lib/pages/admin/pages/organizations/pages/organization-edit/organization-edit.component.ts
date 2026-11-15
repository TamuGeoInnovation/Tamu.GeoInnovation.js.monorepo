import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { OrganizationAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [OrganizationAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => OrganizationEditComponent)]
})
export class OrganizationEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(OrganizationAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
