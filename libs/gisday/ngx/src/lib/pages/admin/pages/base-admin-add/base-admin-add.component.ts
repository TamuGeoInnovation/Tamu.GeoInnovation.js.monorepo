import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/data-access';

export abstract class BaseAdminAddComponent<T, K extends BaseService<T>> implements IBaseAdminAddComponent {
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

export interface IBaseAdminAddComponent extends OnInit, OnDestroy {
  ngOnInit(): void;
  ngOnDestroy(): void;
  submitNewEntity(): void;
}
