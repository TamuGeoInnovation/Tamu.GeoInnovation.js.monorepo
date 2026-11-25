import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { TagAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-tags-add',
  templateUrl: './tags-add.component.html',
  styleUrls: ['./tags-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TagAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => TagsAddComponent)]
})
export class TagsAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(TagAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
