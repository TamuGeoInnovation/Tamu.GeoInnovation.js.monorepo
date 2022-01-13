import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GuidIdentity } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-base-admin-edit',
  template: ''
})
export abstract class BaseAdminEditComponent<T extends GuidIdentity> implements IBaseAdminEditComponent, OnInit, OnDestroy {
  public $entities: Observable<Array<Partial<T>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly entityService: BaseService<T>) {}

  public ngOnInit(): void {
    this.fetchEntities();
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEntities() {
    this.$entities = this.entityService.getEntities().pipe(shareReplay(1));
  }

  public deleteEntity(entity: T) {
    console.log('deleteEntity', entity);
    this.entityService.deleteEntity(entity.guid).subscribe((deleteStatus) => {
      console.log('Deleted ', entity.guid);
      this.fetchEntities();
    });
  }
}

export interface IBaseAdminEditComponent {
  fetchEntities(): void;
  deleteEntity(entity): void;
}
