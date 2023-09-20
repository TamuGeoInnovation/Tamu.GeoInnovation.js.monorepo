import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GuidIdentity } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-base-admin-edit',
  template: ''
})
export abstract class BaseAdminEditComponent<T extends GuidIdentity> implements IBaseAdminEditComponent, OnInit, OnDestroy {
  public $entities: Observable<Array<Partial<T>>>;
  public $signal: Subject<boolean> = new Subject();

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly entityService: BaseService<T>) {}

  public ngOnInit(): void {
    this.$entities = this.$signal.pipe(
      startWith(true),
      switchMap(() => this.entityService.getEntities()),
      shareReplay()
    );
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public deleteEntity(entity: Partial<T>) {
    this.entityService.deleteEntity(entity.guid).subscribe(() => {
      this.$signal.next(true);
    });
  }
}

export interface IBaseAdminEditComponent {
  deleteEntity(entity): void;
}
