import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-detail',
  template: ''
})
export abstract class BaseAdminDetailComponent<T> implements OnInit {
  public entity: Observable<Partial<T>>;

  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private entityService: BaseService<T>
  ) {}

  public ngOnInit() {
    this.entity = this.activatedRoute.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.entityService.getEntity(guid))
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
      });
  }

  public updateEntity() {
    const rawValue = this.form.getRawValue();

    this.entityService.updateEntity(rawValue.guid, rawValue).subscribe((result) => {
      console.log('Updated', result);
    });
  }
}
