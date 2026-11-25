import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { PlaceLocationAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-place-edit',
  templateUrl: './place-edit.component.html',
  styleUrls: ['./place-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PlaceLocationAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => PlaceEditComponent)]
})
export class PlaceEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(PlaceLocationAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
