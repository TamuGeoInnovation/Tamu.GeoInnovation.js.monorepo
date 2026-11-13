import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { map, scan, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { GuidIdentity, Season } from '@tamu-gisc/gisday/platform/data-api';
import { BaseService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  CopyEntityModalResponse,
  EntityCopyModalComponent,
  EntityDeleteModalComponent,
  EntityDeleteModalResponse,
  matchesText
} from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-base-admin-edit',
  template: '',
  standalone: false
})
export abstract class BaseAdminListComponent<T extends GuidIdentity> implements IBaseAdminEditComponent, OnInit {
  /** The service for this page's entity. Each page injects its own. */
  protected abstract readonly entityService: BaseService<T>;

  private readonly seasonService = inject(SeasonService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  public seasons$ = this.seasonService.seasons$;
  public activeSeason$ = this.seasonService.activeSeason$;

  public $entities: Observable<Array<Partial<T>>>;
  public entitiesForActiveSeasonOrForSeasonGuid$: Observable<Array<Partial<T>>>;
  public $signal: Subject<boolean> = new Subject();

  public selectedSeason$: Observable<Partial<Season>>;
  public selectedRows$: Observable<Array<string>>;

  private _selectRow$: Subject<string | Array<string>> = new Subject();

  /**
   * The page's search (#2914). A page that wants one names the text of each row to search, the columns it displays,
   * and puts <tamu-gisc-admin-search> above its list; the list it reads, entitiesForActiveSeasonOrForSeasonGuid$, is
   * then only the rows that match. A page that names none lists every row, as before.
   */
  public readonly search = new FormControl('', { nonNullable: true });
  protected readonly searchFields: ((entity: Partial<T>) => Array<string | null | undefined>) | null = null;
  /** How many rows the search shows, of how many, for the search box. */
  public searchCounts$: Observable<{ shown: number; total: number }>;

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

    // A conditional, not iif: iif builds both branches at once, so with no season (a new site) it read
    // season.guid on null and the list was blank (#2076).
    const seasonEntities$ = this.selectedSeason$.pipe(
      switchMap((season) =>
        season ? this.entityService.getEntitiesForSeason(season.guid) : this.entityService.getEntitiesForActiveSeason()
      ),
      shareReplay()
    );
    const searched$ = combineLatest([seasonEntities$, this.search.valueChanges.pipe(startWith(this.search.value))]).pipe(
      map(([all, search]) => {
        const fields = this.searchFields;
        const shown = fields && all ? all.filter((entity) => matchesText(fields(entity), search)) : all;

        return { all, shown };
      }),
      shareReplay(1)
    );

    this.entitiesForActiveSeasonOrForSeasonGuid$ = searched$.pipe(map(({ shown }) => shown));
    this.searchCounts$ = searched$.pipe(map(({ all, shown }) => ({ shown: shown?.length ?? 0, total: all?.length ?? 0 })));

    // A row the search hides cannot stay selected, or an action on "the selected rows" would act on rows not shown.
    this.search.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this._selectRow$.next(null));

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
      // Only the latest selection: replaying every past one gave a new reader the first, empty selection,
      // so acting on "the selected events" read none (#2092).
      shareReplay(1)
    );
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
