import { OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/data-access';
import { GuidIdentity } from '@tamu-gisc/gisday/data-api';

export abstract class BaseAdminEditComponent<T extends GuidIdentity, K extends BaseService<T>>
  implements IBaseAdminEditComponent {
  public $entities: Observable<Array<Partial<T>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly entityService: K) {}

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

export interface IBaseAdminEditComponent extends OnInit, OnDestroy {
  ngOnInit(): void;
  ngOnDestroy(): void;
  fetchEntities(): void;
  deleteEntity(entity): void;
}
