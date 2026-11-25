import { Component, viewChild } from '@angular/core';

import { TypeAddEditFormComponent, provideAdminDetailsPage } from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

/** Edits a type (#3328), as every admin edit page does: Escape back to the list, asking first with changes not saved. */
@Component({
  selector: 'tamu-gisc-types-edit',
  template: '<tamu-gisc-type-add-edit-form type="edit"></tamu-gisc-type-add-edit-form>',
  imports: [TypeAddEditFormComponent],
  providers: [provideAdminDetailsPage(() => TypesEditComponent)]
})
export class TypesEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(TypeAddEditFormComponent);

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
