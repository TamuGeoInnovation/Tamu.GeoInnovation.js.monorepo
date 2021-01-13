import { Directive, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/data-access';

@Directive()
export abstract class BaseAdminAddComponent<T, K extends BaseService<T>>
  implements IBaseAdminAddComponent, OnInit, OnDestroy {
  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  // TODO: Add better type for formGroup
  constructor(private fb: FormBuilder, private entityService: K, public formGroup: {}) {}

  public ngOnInit() {
    this.form = this.fb.group(this.formGroup);
  }

  public ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public submitNewEntity() {
    this.entityService.createEntity(this.form.value);
  }
}

export interface IBaseAdminAddComponent {
  submitNewEntity(): void;
}
