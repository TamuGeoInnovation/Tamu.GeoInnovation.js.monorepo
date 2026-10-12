import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-base-admin-view',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export abstract class BaseAdminViewComponent<T> implements IBaseAdminViewComponent, OnInit, OnDestroy {
  /** The service for this page's entity. Each page injects its own. */
  public abstract readonly entityService: BaseService<T>;

  public $entities: Observable<Array<Partial<T>>>;
  private _$destroy: Subject<boolean> = new Subject();

  // Not in a constructor: a page's own fields, its entity service among them, are not set until this
  // class's constructor has returned.
  public ngOnInit(): void {
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
