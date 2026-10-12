import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-add',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export abstract class BaseAdminAddComponent<T> implements IBaseAdminAddComponent, OnDestroy {
  /** The service for this page's entity. Each page injects its own. */
  protected abstract readonly entityService: BaseService<T>;

  public form: UntypedFormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public submitNewEntity() {
    this.entityService.createEntity(this.form.value).subscribe((result) => {
      console.log(result);
    });
  }
}

export interface IBaseAdminAddComponent {
  submitNewEntity();
}
