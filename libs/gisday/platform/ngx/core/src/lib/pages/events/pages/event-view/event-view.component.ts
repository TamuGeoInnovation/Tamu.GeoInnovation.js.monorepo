import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, shareReplay, switchMap, toArray } from 'rxjs/operators';

import { Event, Season, Tag } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, SeasonService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit {
  public activeSeason$: Observable<Season>;
  public events$: Observable<Array<Partial<Event>>>;
  public tags$: Observable<Array<Partial<Tag>>>;

  public filterTags: string[] = [];

  constructor(
    private readonly eventService: EventService,
    private readonly tagService: TagService,
    private readonly ss: SeasonService
  ) {}

  public ngOnInit() {
    this.activeSeason$ = this.ss.getActiveSeason().pipe(shareReplay());
    this.events$ = this.eventService.getEvents().pipe(shareReplay());
    this.tags$ = this.tagService.getEntities().pipe(shareReplay());
  }

  public applyOrRemoveTag(tag: Partial<Tag>, checked: boolean) {
    if (checked) {
      // add to filterTags
      this.filterTags.push(tag.name);
    } else {
      // remove from filterTags
      this.filterTags = this.filterTags.filter((value) => {
        if (value !== tag.name) {
          return value;
        }
      });
    }
  }

  public filterEventsByFilterTags(event: Partial<Event>) {
    // if no filter tags are applied, show all events
    if (this.filterTags.length === 0) {
      return true;
    }
    // compare event.tags with this.filterTags
    // if we have even one in common we show the event
    let ret = false;
    this.filterTags.forEach((filterTag: string) => {
      event.tags.forEach((eventTag: Tag) => {
        if (eventTag.name === filterTag) {
          ret = true;
        }
      });
    });

    return ret;
  }

  /**
   * Returns an observable of Event[] that only contains those Events of the day specified (day 1, day 2, day 3)
   * @param dayNum
   * @returns
   */
  public getDay(dayNum: number) {
    return this.events$.pipe(
      switchMap((events) => events),
      // TODO: fix this type casting
      // Will probably remove this altogether but untested as of this comment
      filter((event) => (event.day as any) == dayNum),
      toArray()
    );
  }
}
