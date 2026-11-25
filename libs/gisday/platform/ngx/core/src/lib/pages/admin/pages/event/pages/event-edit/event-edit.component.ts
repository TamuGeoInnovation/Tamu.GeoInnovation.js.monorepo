import { Component, viewChild } from '@angular/core';
import { EventAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss'],
  imports: [EventAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => EventEditComponent)]
})
export class EventEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(EventAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
