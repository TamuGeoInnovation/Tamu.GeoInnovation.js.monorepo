import { Component, viewChild } from '@angular/core';
import { SeasonAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-season-edit',
  templateUrl: './season-edit.component.html',
  styleUrls: ['./season-edit.component.scss'],
  imports: [SeasonAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => SeasonEditComponent)]
})
export class SeasonEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(SeasonAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
