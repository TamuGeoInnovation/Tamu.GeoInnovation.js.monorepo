import { Directive, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/gisday/data-access';
import { GuidIdentity } from '@tamu-gisc/gisday/data-api';

@Directive()
export abstract class BaseAdminEditComponent<T extends GuidIdentity, K extends BaseService<T>>
  implements IBaseAdminEditComponent, OnInit, OnDestroy {
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

export interface IBaseAdminEditComponent {
  fetchEntities(): void;
  deleteEntity(entity): void;
}
