import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { iif, merge, Observable, of, Subject } from 'rxjs';
import { map, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { GuidIdentity, Season } from '@tamu-gisc/gisday/platform/data-api';
import { BaseService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-base-admin-edit',
  template: ''
})
export abstract class BaseAdminListComponent<T extends GuidIdentity> implements IBaseAdminEditComponent, OnInit, OnDestroy {
  public seasons$ = this.seasonService.seasons$;
  public activeSeason$ = this.seasonService.activeSeason$;

  public $entities: Observable<Array<Partial<T>>>;
  public entitiesForActiveSeasonOrFromUrl$: Observable<Array<Partial<T>>>;
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
      })
    );

    this.$entities = this.$signal.pipe(
      startWith(true),
      switchMap(() => this.entityService.getEntities()),
      shareReplay()
    );

    this.entitiesForActiveSeasonOrFromUrl$ = this.selectedSeason$.pipe(
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
}

export interface IBaseAdminEditComponent {
  deleteEntity(entity): void;
}
