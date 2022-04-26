import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-detail',
  template: ''
})
export abstract class BaseAdminDetailComponent<T> implements OnInit, OnDestroy {
  public entity: Observable<DeepPartial<T>>;
  public $formChange: Observable<Partial<T>>;

  public formGroup = {};
  public form: FormGroup;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private entityService: BaseService<T>) {}

  public ngOnInit() {
    this.entity = this.route.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.entityService.getEntityWithRelations(guid))
    );

    this.entity
      .pipe(
        tap((_entity) => {
          this.form.patchValue(_entity);
        }) // Lets keep this for now as I'm not sure if we'll subscribe to the form valueChange observable here or in the component still - Aaron H (4/26/22)
        // switchMap((_entity) => {
        //   return this.form.valueChanges.pipe(debounceTime(1000));
        // }),
        // map((formValues) => {
        //   return this.form.getRawValue();
        // }),
        // switchMap((rawValue) => {
        //   return this.entityService.updateEntity(rawValue);
        // })
      )
      .subscribe((result) => {
        console.log('Patched form', result);
      })
      .add(this._$destroy);
  }

  public ngOnDestroy(): void {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public updateEntity() {
    const rawValue = this.form.getRawValue();
    this.entityService.updateEntity(rawValue).subscribe((result) => {
      console.log('Updated', result);
    });
  }
}
