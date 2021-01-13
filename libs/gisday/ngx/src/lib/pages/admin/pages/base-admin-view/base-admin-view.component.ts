import { Component, Directive, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { BaseService } from '@tamu-gisc/gisday/data-access';

@Directive()
export abstract class BaseAdminViewComponent<T, K extends BaseService<T>>
  implements IBaseAdminViewComponent, OnInit, OnDestroy {
  public $entities: Observable<Array<Partial<T>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(public readonly entityService: K) {
    this.fetchEntities();
  }

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEntities() {
    this.$entities = this.entityService.getEntities();
  }
}

export interface IBaseAdminViewComponent {
  fetchEntities(): void;
}
