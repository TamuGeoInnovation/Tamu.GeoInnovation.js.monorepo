import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { SpeakerAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-speaker-add',
  templateUrl: './speaker-add.component.html',
  styleUrls: ['./speaker-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerAddEditFormComponent]
})
export class SpeakerAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(SpeakerAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
