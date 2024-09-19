import { Component, OnInit } from '@angular/core';
import {
  iif,
  map,
  merge,
  Observable,
  of,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event, Season } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import {
  CopyEntityModalResponse,
  EntityCopyModalComponent,
  EntityDeleteModalComponent,
  EntityDeleteModalResponse
} from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent extends BaseAdminListComponent<Event> implements OnInit {
  public seasons$ = this.ss.seasons$;
  public activeSeason$ = this.ss.activeSeason$;
  public selectedSeason$: Observable<Partial<Season>>;

  private _selectRow$: Subject<string | Array<string>> = new Subject();
  private _refresh$: Subject<void> = new Subject();
  public selectedRows$: Observable<Array<string>>;

  constructor(
    private readonly eventService: EventService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(eventService);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.selectedSeason$ = merge(this._refresh$.pipe(map(() => this.ar.snapshot.queryParams)), this.ar.queryParams).pipe(
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

    this.$entities = this.selectedSeason$.pipe(
      switchMap((season) => {
        return iif(() => season === null, this.eventService.getEntities(), this.eventService.getEvents(season.guid));
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

  public setSeason(seasonGuid: string) {
    this.rt.navigate([], {
      relativeTo: this.ar,
      queryParams: {
        season: seasonGuid
      }
    });
  }

  public toggleRow(guid: string) {
    this._selectRow$.next(guid);
  }

  public toggleAllRows(events: Array<Partial<Event>>) {
    this._selectRow$.next(events.map((event) => event.guid));
  }

  public promptCopyModal() {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, guids]) => {
          return this.ms.open(EntityCopyModalComponent, {
            data: {
              identities: guids,
              entityType: 'Event',
              notice:
                'This action will only copy event details and not any associated relations such as event date, presenters, or location as those change from season to season. Those will have to be set manually on a per-event basis.'
            }
          });
        })
      )
      .subscribe({
        next: (result: CopyEntityModalResponse<string>) => {
          if (result?.copy) {
            this.eventService.copyEventsIntoSeason(result?.season?.guid, result.identities).subscribe(() => {
              this.ns.toast({
                message: `${result.identities.length} event${result?.identities.length > 1 ? 's' : ''} copied into season ${
                  result.season?.year
                }`,
                id: 'event-copy-success',
                title: 'Events Copied'
              });

              this._selectRow$.next(null);
            });
          } else {
            console.log('Copy canceled');
          }
        }
      });
  }

  public promptDeleteModal() {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, guids]) => {
          return this.ms.open(EntityDeleteModalComponent, {
            data: {
              identities: guids,
              entityType: 'Event'
            }
          });
        })
      )
      .subscribe({
        next: (result: EntityDeleteModalResponse) => {
          if (result?.delete) {
            this.eventService.deleteEvents(result?.identities).subscribe(() => {
              this.ns.toast({
                message: `${result.identities.length} event${result.identities.length > 1 ? 's' : ''} deleted`,
                id: 'event-delete-success',
                title: 'Events Deleted'
              });

              this._refresh$.next(null);
            });
          } else {
            console.log('Delete canceled');
          }
        }
      });
  }
}
