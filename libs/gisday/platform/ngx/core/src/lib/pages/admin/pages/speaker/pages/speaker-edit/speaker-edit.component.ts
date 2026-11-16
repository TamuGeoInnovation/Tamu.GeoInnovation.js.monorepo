import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { SpeakerAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-speaker-edit',
  templateUrl: './speaker-edit.component.html',
  styleUrls: ['./speaker-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => SpeakerEditComponent)]
})
export class SpeakerEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(SpeakerAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
