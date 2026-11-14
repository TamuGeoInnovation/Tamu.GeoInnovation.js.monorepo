import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { SponsorAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-sponsor-add',
  templateUrl: './sponsor-add.component.html',
  styleUrls: ['./sponsor-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SponsorAddEditFormComponent]
})
export class SponsorAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(SponsorAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
