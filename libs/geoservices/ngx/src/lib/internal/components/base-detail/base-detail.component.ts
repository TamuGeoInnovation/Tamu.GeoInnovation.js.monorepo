import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, switchMap, tap, takeUntil } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/geoservices/data-access';

import { IdIdentity } from '../../interfaces';

@Component({
  selector: 'tamu-gisc-geoservices-base-detail',
  template: ''
})
export abstract class BaseDetailComponent<T extends IdIdentity> implements OnInit, OnDestroy {
  public entity: Observable<Partial<T>>;
  public form: FormGroup;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private entityService: BaseService<T>
  ) {}

  public ngOnInit() {
    this.entity = this.activatedRoute.params.pipe(
      map((params) => params.id),
      filter((id) => id !== undefined),
      switchMap((id) => this.entityService.getById(id))
    );

    this.entity
      .pipe(
        tap((_entity) => {
          this.form.patchValue(_entity);
        }),
        takeUntil(this._$destroy)
      )
      .subscribe((result) => {
        console.log('Patched form', result);
      });
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public updateEntity() {
    const rawValue = this.form.getRawValue();

    this.entityService.update(rawValue.id, rawValue).subscribe((result) => {
      console.log('Updated', result);
    });
  }

  public deleteEntity() {
    const rawValue = this.form.getRawValue();

    this.entityService.delete(rawValue.id).subscribe((result) => {
      console.log('Deleted', result);
    });
  }
}
