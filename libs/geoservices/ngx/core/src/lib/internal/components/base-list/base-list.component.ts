import { Component, OnDestroy, OnInit } from '@angular/core';
import { merge, Observable, of, Subject } from 'rxjs';
import { map, scan, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '@tamu-gisc/geoservices/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { IdIdentity } from '../../interfaces';

// Simple confirmation modal interfaces - these would need to be implemented
// or imported from existing modal components
export interface DeleteModalResponse {
  delete: boolean;
  identities: (string | number)[];
}

export interface CloneModalResponse {
  clone: boolean;
  identities: (string | number)[];
}

@Component({
  selector: 'tamu-gisc-geoservices-base-list',
  template: ''
})
export abstract class BaseListComponent<T extends IdIdentity> implements IBaseListComponent, OnInit, OnDestroy {
  public $entities: Observable<Array<T>>;
  public $signal: Subject<boolean> = new Subject();
  public selectedRows$: Observable<Array<string | number>>;

  private _selectRow$: Subject<string | number | Array<string | number>> = new Subject();
  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private readonly entityService: BaseService<T>,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    this.$entities = this.$signal.pipe(
      startWith(true),
      switchMap(() => this.entityService.getAll()),
      shareReplay()
    );

    this.selectedRows$ = this._selectRow$.pipe(
      scan((acc, idOrList) => {
        // Clearing mechanism for whenever the entity list changes, reset selected rows
        if (idOrList === null) {
          return [];
        }

        if (Array.isArray(idOrList)) {
          // If the acc is the same size as the incoming list, we assume that all items are selected
          if (acc.length === idOrList.length) {
            return [];
          }

          return idOrList;
        }

        if (acc.includes(idOrList)) {
          return acc.filter((id) => id !== idOrList);
        } else {
          return [...acc, idOrList];
        }
      }, [] as Array<string | number>),
      startWith([]),
      shareReplay()
    );
  }

  public ngOnDestroy() {
    this._$destroy.next(true);
    this._$destroy.complete();
  }

  public deleteEntity(entity: Partial<T>) {
    this.entityService.delete(Number(entity.id)).subscribe(() => {
      this.$signal.next(true);
    });
  }

  public toggleRow(id: string | number) {
    this._selectRow$.next(id);
  }

  public toggleAllRows(entities: Array<Partial<T>>) {
    const ent = entities.map((entity) => entity.id).filter((id) => id !== undefined && id !== null);

    this._selectRow$.next(ent);
  }

  /**
   * Prompts the user with a confirmation modal to delete entities.
   *
   * @param singularEntityName Singular entity name to be used in the modal
   * @param message Optional message to be displayed in the modal
   * @param pluralEntityName Optional plural entity name to be used in the modal
   */
  public promptDeleteModal(singularEntityName: string, message?: string, pluralEntityName?: string) {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, ids]) => {
          const entityName = this._pluralizeEntityName(singularEntityName, ids, pluralEntityName);

          return this.modalService
            .open<Record<string, never>, boolean>({
              title: `Delete ${entityName}`,
              subTitle: `Are you sure you want to delete the selected ${entityName.toLowerCase()}?`,
              body: 'This action is immediate and cannot be undone. Please confirm that you understand the consequences of this action.',
              actions: {
                buttons: [
                  {
                    label: "No, I've changed my mind",
                    value: false,
                    style: 'secondary'
                  },
                  {
                    label: 'Yes, I understand',
                    value: true,
                    style: 'danger'
                  }
                ]
              }
            })
            .pipe(
              map(
                (confirmed: boolean) =>
                  ({
                    delete: !!confirmed,
                    identities: ids
                  } as DeleteModalResponse)
              )
            );
        })
      )
      .subscribe((result: DeleteModalResponse) => {
        if (result?.delete) {
          const normalizedEntityName = this._pluralizeEntityName(singularEntityName, result.identities, pluralEntityName);

          // Delete entities one by one - could be optimized with bulk delete endpoint
          const deleteRequests = result.identities.map((id) => this.entityService.delete(Number(id)));

          merge(...deleteRequests).subscribe(() => {
            this.notificationService.toast({
              message: `${result.identities.length} ${normalizedEntityName.toLowerCase()} deleted`,
              id: 'entity-delete-success',
              title: `${normalizedEntityName} Deleted`
            });

            this.$signal.next(true);
          });
        } else {
          console.log('Delete canceled');
        }
      });
  }

  /**
   * Prompts the user with a modal to clone entities.
   * Note: This is a placeholder implementation as cloning logic would depend on specific requirements
   *
   * @param singularEntityName Singular entity name to be used in the modal
   * @param message Optional message to be displayed in the modal
   * @param pluralEntityName Optional plural entity name to be used in the modal
   */
  public promptCloneModal(singularEntityName: string, message?: string, pluralEntityName?: string) {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, ids]) => {
          const entityName = this._pluralizeEntityName(singularEntityName, ids, pluralEntityName);
          const confirmMessage = message || `Are you sure you want to clone ${ids.length} ${entityName.toLowerCase()}?`;

          return this.modalService
            .open<Record<string, never>, boolean>({
              title: `Clone ${entityName}`,
              body: confirmMessage,
              actions: {
                buttons: [
                  {
                    label: 'No',
                    value: false,
                    style: 'secondary'
                  },
                  {
                    label: 'Yes',
                    value: true,
                    style: 'success'
                  }
                ]
              }
            })
            .pipe(
              map(
                (confirmed: boolean) =>
                  ({
                    clone: !!confirmed,
                    identities: ids
                  } as CloneModalResponse)
              )
            );
        })
      )
      .subscribe((result: CloneModalResponse) => {
        if (result?.clone) {
          const normalizedEntityName = this._pluralizeEntityName(singularEntityName, result.identities, pluralEntityName);

          // Clone logic would need to be implemented based on requirements
          // This is a placeholder
          this.entityService.clone(result.identities).subscribe(() => {
            this.notificationService.toast({
              message: `${result.identities.length} ${normalizedEntityName.toLowerCase()} cloned`,
              id: 'entity-clone-success',
              title: `${normalizedEntityName} Cloned`
            });

            this.$signal.next(true);
          });
        } else {
          console.log('Clone canceled');
        }
      });
  }

  /**
   * Helper function to pluralize entity names based on count.
   * If `pluralEntityName` is provided, it will be used; otherwise, the default pluralization by appending 's' is applied.
   *
   * @param entityName The singular entity name
   * @param count The array of entities to determine the count
   * @param pluralEntityName Optional plural entity name to be used if provided
   * @returns The pluralized entity name based on the count
   */
  private _pluralizeEntityName(entityName: string, count: Array<unknown>, pluralEntityName?: string) {
    if (count.length > 1) {
      if (pluralEntityName) {
        return pluralEntityName;
      } else {
        return `${entityName}s`;
      }
    }
    return entityName;
  }
}

export interface IBaseListComponent {
  deleteEntity(entity: Partial<IdIdentity>): void;
}
