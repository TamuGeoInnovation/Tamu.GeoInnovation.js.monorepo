import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { BroadcastAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-broadcast-edit',
  templateUrl: './broadcast-edit.component.html',
  styleUrls: ['./broadcast-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BroadcastAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => BroadcastEditComponent)]
})
export class BroadcastEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(BroadcastAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
