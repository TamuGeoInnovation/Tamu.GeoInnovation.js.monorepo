import { Component, OnDestroy } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-view',
  template: ''
})
export abstract class BaseAdminViewComponent<T> implements IBaseAdminViewComponent, OnDestroy {
  public $entities: Observable<Array<Partial<T>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(public readonly entityService: BaseService<T>) {
    this.fetchEntities();
  }

  public ngOnDestroy(): void {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public fetchEntities() {
    this.$entities = this.entityService.getEntities();
  }
}

export interface IBaseAdminViewComponent {
  fetchEntities(): void;
}
