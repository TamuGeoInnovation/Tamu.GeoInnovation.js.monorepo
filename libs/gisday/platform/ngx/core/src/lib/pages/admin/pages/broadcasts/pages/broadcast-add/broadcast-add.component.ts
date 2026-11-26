import { Component, viewChild } from '@angular/core';
import { BroadcastAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-broadcast-add',
  templateUrl: './broadcast-add.component.html',
  styleUrls: ['./broadcast-add.component.scss'],
  imports: [BroadcastAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => BroadcastAddComponent)]
})
export class BroadcastAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(BroadcastAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
