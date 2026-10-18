import { Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-add',
  template: '',
  standalone: false
})
export abstract class BaseAdminAddComponent<T> implements IBaseAdminAddComponent {
  /** The service for this page's entity. Each page injects its own. */
  protected abstract readonly entityService: BaseService<T>;

  public form: UntypedFormGroup;

  public submitNewEntity() {
    this.entityService.createEntity(this.form.value).subscribe((result) => {
      console.log(result);
    });
  }
}

export interface IBaseAdminAddComponent {
  submitNewEntity();
}
