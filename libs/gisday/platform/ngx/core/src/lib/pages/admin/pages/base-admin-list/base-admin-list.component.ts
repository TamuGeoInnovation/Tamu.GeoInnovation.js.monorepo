import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { FormControl } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

import { combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { filter, map, scan, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { GuidIdentity, Season } from '@tamu-gisc/gisday/platform/data-api';
import { BaseService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  CopyEntityModalResponse,
  EntityCopyModalComponent,
  EntityDeleteModalComponent,
  EntityDeleteModalResponse,
  matchesText,
  seasonPicker
} from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-base-admin-edit',
  template: '',
  standalone: false
})
export abstract class BaseAdminListComponent<T extends GuidIdentity> implements IBaseAdminEditComponent, OnInit {
  /** The service for this page's entity. Each page injects its own. */
  protected abstract readonly entityService: BaseService<T>;

  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly listDestroyRef = inject(DestroyRef);
  private readonly listLocation = inject(Location);

  /** The season shown, from the address (#3329). */
  private readonly picker = seasonPicker();
  public seasons$ = this.picker.seasons$;

  public $entities: Observable<Array<Partial<T>>>;
  public entitiesForActiveSeasonOrForSeasonGuid$: Observable<Array<Partial<T>>>;
  public $signal: Subject<boolean> = new Subject();

  public selectedSeason$: Observable<Partial<Season>>;
  /** The selected season's records before the page's filters and search, for a filter that offers what they hold (#434). */
  protected listed$: Observable<Array<Partial<T>>>;
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

  /**
   * Why the list shows no rows (#3049): 'none' when the season has none, 'hidden' when it has some and the search or the
   * page's filters hide every one, so a page does not say the season has none while a filter is on. null while it shows rows.
   */
  public emptyBecause$: Observable<'none' | 'hidden' | null>;
  /** Whether the search or any of the page's filters is changed from where it starts, so clearFilters() would change the list. */
  public filtersInUse$: Observable<boolean>;

  /**
   * The page's filters, by name: its search, and any filter of its own a page adds (#2942). They are kept in the
   * list's own history entry, so going back to the list from a details page (Escape there, or the browser's Back)
   * shows it as it was left, while opening the list afresh starts with none. The season is in the address already.
   */
  protected listFilters(): Record<string, FormControl<string>> {
    return { search: this.search };
  }

  /**
   * Whether the list shows an entity at all, before the search: every one, unless a page narrows it (#2986). Read again
   * whenever one of the page's filters changes.
   */
  protected keepEntity(entity: Partial<T>): boolean {
    return !!entity;
  }

  private keepFiltersInHistory() {
    const filters = this.listFilters();
    const kept = (this.listLocation.getState() as { adminList?: Record<string, unknown> } | null)?.adminList ?? {};

    for (const [name, control] of Object.entries(filters)) {
      if (typeof kept[name] === 'string') {
        control.setValue(kept[name] as string);
      }
    }

    // On every change, and on every new entry the list makes for itself (choosing a season), once its address is in
    // place: the filters stay as they are across a change of season, so the new entry must carry them too.
    merge(
      ...Object.values(filters).map((control) => control.valueChanges),
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
    )
      .pipe(takeUntilDestroyed(this.listDestroyRef))
      .subscribe(() => {
        const values = Object.fromEntries(Object.entries(filters).map(([name, control]) => [name, control.value]));
        const state = (this.listLocation.getState() as Record<string, unknown> | null) ?? {};

        // The same address, with the router's own state kept beside the filters.
        this.listLocation.replaceState(this.listLocation.path(), '', { ...state, adminList: values });
      });
  }

  public ngOnInit(): void {
    this.keepFiltersInHistory();

    // Read again after a copy or a delete, so the list is.
    this.selectedSeason$ = this.$signal.pipe(
      startWith(true),
      switchMap(() => this.picker.season$),
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
    this.listed$ = this.selectedSeason$.pipe(
      switchMap((season) =>
        season ? this.entityService.getEntitiesForSeason(season.guid) : this.entityService.getEntitiesForActiveSeason()
      ),
      shareReplay()
    );
    const filters = Object.values(this.listFilters()).map((control) => control.valueChanges.pipe(startWith(control.value)));
    const searched$ = combineLatest([this.listed$, ...filters]).pipe(
      map(([listed]) => {
        const all = listed ? (listed as Array<Partial<T>>).filter((entity) => this.keepEntity(entity)) : listed;
        const fields = this.searchFields;
        const shown = fields && all ? all.filter((entity) => matchesText(fields(entity), this.search.value)) : all;

        const inUse = Object.values(this.listFilters()).some((control) => control.value !== control.defaultValue);

        return { listed: listed as Array<Partial<T>>, all, shown, inUse };
      }),
      shareReplay(1)
    );

    this.entitiesForActiveSeasonOrForSeasonGuid$ = searched$.pipe(map(({ shown }) => shown));
    this.searchCounts$ = searched$.pipe(map(({ all, shown }) => ({ shown: shown?.length ?? 0, total: all?.length ?? 0 })));
    this.emptyBecause$ = searched$.pipe(map(({ listed, shown }) => (shown?.length ? null : listed?.length ? 'hidden' : 'none')));
    this.filtersInUse$ = searched$.pipe(map(({ inUse }) => inUse));

    // A row the search hides cannot stay selected, or an action on "the selected rows" would act on rows not shown.
    this.search.valueChanges.pipe(takeUntilDestroyed(this.listDestroyRef)).subscribe(() => this._selectRow$.next(null));

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

  /** Puts the search and every filter of the page back where they start, for a list they leave empty (#3049). */
  public clearFilters() {
    for (const control of Object.values(this.listFilters())) {
      control.reset();
    }
  }

  public setSeason(seasonGuid: string) {
    this.picker.choose(seasonGuid);
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

            this.entityService.deleteEntities(result?.identities).subscribe({
              next: () => {
                this.notificationService.toast({
                  message: `${result.identities.length} ${normalizedEntityName.toLowerCase()} deleted`,
                  id: 'entity-delete-success',
                  title: `${normalizedEntityName} Deleted`
                });

                this.$signal.next(null);
              },
              // A refused delete said nothing, so the rows simply stayed (#2992).
              error: (err) => {
                this.notificationService.toast({
                  message: `Nothing was deleted: ${err?.error?.message ?? err?.statusText ?? 'the server refused'}.`,
                  id: 'entity-delete-failed',
                  title: `${normalizedEntityName} Not Deleted`
                });
              }
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
