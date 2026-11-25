import { Component, viewChild } from '@angular/core';
import { UniversityAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-university-add',
  templateUrl: './university-add.component.html',
  styleUrls: ['./university-add.component.scss'],
  imports: [UniversityAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => UniversityAddComponent)]
})
export class UniversityAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(UniversityAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
