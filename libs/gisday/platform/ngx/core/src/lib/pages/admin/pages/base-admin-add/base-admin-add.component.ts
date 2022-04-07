import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-add',
  template: ''
})
export abstract class BaseAdminAddComponent<T> implements IBaseAdminAddComponent, OnInit, OnDestroy {
  // public formGroup: {};

  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private entityService: BaseService<T>) {}

  public ngOnInit() {
    // this.form = this.fb.group(this.formGroup);
    // this.form = this.formGroup;
  }

  public ngOnDestroy(): void {
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
  submitNewEntity(): void;
}
