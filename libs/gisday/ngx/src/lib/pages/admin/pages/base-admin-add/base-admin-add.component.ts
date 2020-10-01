import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseService } from '@tamu-gisc/gisday/data-access';
import { Subject } from 'rxjs';

export abstract class BaseAdminAddComponent<T, K extends BaseService<T>> implements IBaseAdminEditComponent {
  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  // TODO: Add better type for formGroup
  constructor(private fb: FormBuilder, private entityService: K, public formGroup: {}) {}

  ngOnInit() {
    this.form = this.fb.group(this.formGroup);
  }

  ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  submitNewEntity() {
    this.entityService.createEntity(this.form.value);
  }
}

export interface IBaseAdminEditComponent extends OnInit, OnDestroy {
  ngOnInit(): void;
  ngOnDestroy(): void;
  submitNewEntity(): void;
}
