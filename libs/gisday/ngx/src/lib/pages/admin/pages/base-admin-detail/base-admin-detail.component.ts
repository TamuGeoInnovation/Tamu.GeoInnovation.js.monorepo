import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-detail',
  template: ''
})
export abstract class BaseAdminDetailComponent<T> implements IBaseAdminAddComponent, OnInit, OnDestroy {
  public entityGuid: string;
  public entity: Partial<T>;

  public formGroup: {};
  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private entityService: BaseService<T>) {
    this.form = this.fb.group(this.formGroup);
  }

  public ngOnInit() {
    if (this.route.snapshot.params.guid) {
      this.entityGuid = this.route.snapshot.params.guid;
      this.entityService.getEntity(this.entityGuid).subscribe((entity) => {
        this.entity = entity;
        this.form.patchValue(this.entity);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
          this.entityService
            .updateEntity(this.form.getRawValue())
            .subscribe((result) => [console.log('Updated entity', this.entity)]);
        });
      });
    }
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
