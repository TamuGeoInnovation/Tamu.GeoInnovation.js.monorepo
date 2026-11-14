import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { TagAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TagAddEditFormComponent]
})
export class TagsEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(TagAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
