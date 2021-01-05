import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/data-access';

export abstract class BaseAdminDetailComponent<T, K extends BaseService<T>> implements IBaseAdminAddComponent {
  public entityGuid: string;
  public entity: Partial<T>;
  public form: FormGroup;
  private _$destroy: Subject<boolean> = new Subject();

  // TODO: Add better type for formGroup
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private entityService: K, public formGroup: {}) {
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

export interface IBaseAdminAddComponent extends OnInit, OnDestroy {
  ngOnInit(): void;
  ngOnDestroy(): void;
  submitNewEntity(): void;
}
