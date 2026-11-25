import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';

import { TypeAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

/** Adds a type (#3328), as every admin add page does: Escape back to the list, asking first if anything is typed. */
@Component({
  selector: 'tamu-gisc-types-add',
  template: '<tamu-gisc-type-add-edit-form type="create"></tamu-gisc-type-add-edit-form>',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TypeAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => TypesAddComponent)]
})
export class TypesAddComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(TypeAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
