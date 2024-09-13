import { Component, OnInit } from '@angular/core';
import { map, merge, shareReplay, Subject, switchMap, withLatestFrom } from 'rxjs';

import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent extends BaseAdminListComponent<Event> implements OnInit {
  public seasons$ = this.ss.seasons$;
  public activeSeason$ = this.ss.activeSeason$;
  public selectedSeason$: Subject<string> = new Subject();

  constructor(private readonly eventService: EventService, private readonly ss: SeasonService) {
    super(eventService);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.$entities = merge(
      this.activeSeason$,
      this.selectedSeason$.pipe(
        withLatestFrom(this.seasons$),
        map(([seasonGuid, seasons]) => {
          return seasons.find((season) => season.guid === seasonGuid);
        })
      )
    ).pipe(
      switchMap((season) => {
        return this.eventService.getEvents(season.guid);
      }),
      shareReplay()
    );
  }

  public setSeason(seasonGuid: string) {
    this.selectedSeason$.next(seasonGuid);
  }
}
