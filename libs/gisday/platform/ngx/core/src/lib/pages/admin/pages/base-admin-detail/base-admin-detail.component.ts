import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-detail',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export abstract class BaseAdminDetailComponent<T> implements OnInit {
  /** The service for this page's entity. Each page injects its own. */
  protected abstract readonly entityService: BaseService<T>;

  private readonly activatedRoute = inject(ActivatedRoute);

  public entity: Observable<Partial<T>>;

  public form: UntypedFormGroup;

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
