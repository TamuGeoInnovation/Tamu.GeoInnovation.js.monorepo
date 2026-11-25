import { Component, viewChild } from '@angular/core';
import { PlaceLocationAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-place-add',
  templateUrl: './place-add.component.html',
  styleUrls: ['./place-add.component.scss'],
  imports: [PlaceLocationAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => PlaceAddComponent)]
})
export class PlaceAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(PlaceLocationAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
