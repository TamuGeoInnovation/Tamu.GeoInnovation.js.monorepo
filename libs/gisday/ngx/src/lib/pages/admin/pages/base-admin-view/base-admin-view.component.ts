import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseService } from '@tamu-gisc/gisday/data-access';
import { Observable, Subject } from 'rxjs';

export abstract class BaseAdminViewComponent<T, K extends BaseService<T>> implements IBaseAdminViewComponent {
  public $entities: Observable<Array<Partial<T>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(public readonly entityService: K) {
    this.fetchEntities();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  fetchEntities() {
    this.$entities = this.entityService.getEntities();
  }
}

export interface IBaseAdminViewComponent extends OnInit, OnDestroy {
  ngOnInit(): void;
  ngOnDestroy(): void;
  fetchEntities(): void;
}
