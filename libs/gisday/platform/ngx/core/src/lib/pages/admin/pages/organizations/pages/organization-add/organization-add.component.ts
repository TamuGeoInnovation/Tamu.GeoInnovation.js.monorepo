import { Component, viewChild } from '@angular/core';
import { OrganizationAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-organization-add',
  templateUrl: './organization-add.component.html',
  styleUrls: ['./organization-add.component.scss'],
  imports: [OrganizationAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => OrganizationAddComponent)]
})
export class OrganizationAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(OrganizationAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
