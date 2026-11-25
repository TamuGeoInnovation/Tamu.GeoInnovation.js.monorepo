import { Component, viewChild } from '@angular/core';
import { ClassAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-class-add',
  templateUrl: './class-add.component.html',
  styleUrls: ['./class-add.component.scss'],
  imports: [ClassAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => ClassAddComponent)]
})
export class ClassAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(ClassAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
