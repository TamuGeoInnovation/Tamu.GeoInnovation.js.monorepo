import { Component, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-geoservices-base-add',
  template: ''
})
export abstract class BaseAddComponent<T> implements IBaseAddComponent, OnDestroy {
  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private entityService: BaseService<T>) {}

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public submitNewEntity() {
    this.entityService.create(this.form.value).subscribe((result) => {
      console.log(result);
    });
  }
}

export interface IBaseAddComponent {
  submitNewEntity(): void;
}
