import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { SponsorAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-sponsor-edit',
  templateUrl: './sponsor-edit.component.html',
  styleUrls: ['./sponsor-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SponsorAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => SponsorEditComponent)]
})
export class SponsorEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(SponsorAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
