import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { iif, merge, Observable, of, Subject } from 'rxjs';
import { map, scan, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { GuidIdentity, Season } from '@tamu-gisc/gisday/platform/data-api';
import { BaseService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  CopyEntityModalResponse,
  EntityCopyModalComponent,
  EntityDeleteModalComponent,
  EntityDeleteModalResponse
} from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-base-admin-edit',
  template: ''
})
export abstract class BaseAdminListComponent<T extends GuidIdentity> implements IBaseAdminEditComponent, OnInit, OnDestroy {
  public seasons$ = this.seasonService.seasons$;
  public activeSeason$ = this.seasonService.activeSeason$;

  public $entities: Observable<Array<Partial<T>>>;
  public entitiesForActiveSeasonOrForSeasonGuid$: Observable<Array<Partial<T>>>;
  public $signal: Subject<boolean> = new Subject();

  public selectedSeason$: Observable<Partial<Season>>;
  public selectedRows$: Observable<Array<string>>;

  private _selectRow$: Subject<string | Array<string>> = new Subject();
  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private readonly entityService: BaseService<T>,
    private readonly seasonService: SeasonService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    this.selectedSeason$ = merge(
      this.$signal.pipe(map(() => this.activatedRoute.snapshot.queryParams)),
      this.activatedRoute.queryParams
    ).pipe(
      map((params) => params.season),
      switchMap((seasonGuid) => {
        return this.seasons$.pipe(
          map((seasons) => {
            if (seasonGuid) {
              return seasons.find((season) => season.guid === seasonGuid);
            }

            return null;
          })
        );
      }),
      switchMap((season) => {
        if (season) {
          return of(season);
        } else {
          return this.activeSeason$.pipe(map((activeSeason) => activeSeason));
        }
      }),
      tap((season) => {
        if (season) {
          this._selectRow$.next(null);
        }
      }),
      shareReplay(1)
    );

    this.$entities = this.$signal.pipe(
      startWith(true),
      switchMap(() => this.entityService.getEntities()),
      shareReplay()
    );

    this.entitiesForActiveSeasonOrForSeasonGuid$ = this.selectedSeason$.pipe(
      switchMap((season) => {
        return iif(
          () => season === null,
          this.entityService.getEntitiesForActiveSeason(),
          this.entityService.getEntitiesForSeason(season.guid)
        );
      }),
      shareReplay()
    );

    this.selectedRows$ = this._selectRow$.pipe(
      scan((acc, guidOrList) => {
        // Clearing mechanism for whenever the entity list changes, reset selected rows
        if (guidOrList === null) {
          return [];
        }

        if (Array.isArray(guidOrList)) {
          // If the acc is the same size as the incoming list, we assume that all items are selected
          if (acc.length === guidOrList.length) {
            return [];
          }

          return guidOrList;
        }

        if (acc.includes(guidOrList)) {
          return acc.filter((g) => g !== guidOrList);
        } else {
          return [...acc, guidOrList];
        }
      }, []),
      startWith([]),
      shareReplay()
    );
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public setSeason(seasonGuid: string) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        season: seasonGuid
      }
    });
  }

  public deleteEntity(entity: Partial<T>) {
    this.entityService.deleteEntity(entity.guid).subscribe(() => {
      this.$signal.next(true);
    });
  }

  public toggleRow(guid: string) {
    this._selectRow$.next(guid);
  }

  public toggleAllRows(events: Array<Partial<T>>) {
    this._selectRow$.next(events.map((event) => event.guid));
  }

  /**
   * Prompts the user with a modal to copy entities.
   *
   * @param singularEntityName Singular entity name to be used in the modal. If pluralEntityName is not provided, the suffix 's' will be appended to the entity name
   * @param message Optional message to be displayed in the modal
   * @param pluralEntityName Optional plural entity name to be used in the modal. Used when the ending suffix is not a simple 's'
   */
  public promptCopyModal(singularEntityName: string, message?: string, pluralEntityName?: string) {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, guids]) => {
          return this.modalService.open(EntityCopyModalComponent, {
            data: {
              identities: guids,
              entityType: singularEntityName,
              pluralEntityType: pluralEntityName,
              notice: message
            }
          });
        })
      )
      .subscribe({
        next: (result: CopyEntityModalResponse<string>) => {
          if (result?.copy) {
            const normalizedEntityName = this._pluralizeEntityName(singularEntityName, result.identities, pluralEntityName);

            this.entityService.copyEntitiesIntoSeason(result?.season?.guid, result.identities).subscribe(() => {
              this.notificationService.toast({
                message: `${result.identities.length} ${normalizedEntityName.toLowerCase()} copied into season ${
                  result.season?.year
                }`,
                id: 'entity-copy-success',
                title: `${normalizedEntityName} Copied`
              });

              this.$signal.next(null);
            });
          } else {
            console.log('Copy canceled');
          }
        }
      });
  }

  /**
   * Prompts the user with a confirmation modal to delete entities.
   *
   * @param singularEntityName Singular entity name to be used in the modal. If pluralEntityName is not provided, the suffix 's' will be appended to the entity name
   * @param message Optional message to be displayed in the modal
   * @param pluralEntityName Optional plural entity name to be used in the modal. Used when the ending suffix is not a simple 's'
   */
  public promptDeleteModal(singularEntityName: string, message?: string, pluralEntityName?: string) {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, guids]) => {
          return this.modalService.open(EntityDeleteModalComponent, {
            data: {
              identities: guids,
              entityType: singularEntityName,
              pluralEntityType: pluralEntityName,
              notice: message
            }
          });
        })
      )
      .subscribe({
        next: (result: EntityDeleteModalResponse) => {
          if (result?.delete) {
            const normalizedEntityName = this._pluralizeEntityName(singularEntityName, result.identities, pluralEntityName);

            this.entityService.deleteEntities(result?.identities).subscribe(() => {
              this.notificationService.toast({
                message: `${result.identities.length} ${normalizedEntityName.toLowerCase()} deleted`,
                id: 'entity-delete-success',
                title: `${normalizedEntityName} Deleted`
              });

              this.$signal.next(null);
            });
          } else {
            console.log('Delete canceled');
          }
        }
      });
  }

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

export interface IBaseAdminEditComponent {
  deleteEntity(entity): void;
}
