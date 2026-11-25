import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { EventAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EventAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => EventAddComponent)]
})
export class EventAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(EventAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
