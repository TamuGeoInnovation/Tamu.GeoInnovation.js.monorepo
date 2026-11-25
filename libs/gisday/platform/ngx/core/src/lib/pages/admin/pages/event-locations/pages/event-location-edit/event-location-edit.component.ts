import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { EventLocationAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-event-location-edit',
  templateUrl: './event-location-edit.component.html',
  styleUrls: ['./event-location-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EventLocationAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => EventLocationEditComponent)]
})
export class EventLocationEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(EventLocationAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
