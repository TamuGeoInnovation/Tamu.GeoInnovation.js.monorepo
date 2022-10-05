import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { concatMap, filter, mergeAll, shareReplay, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';

import { Event, Tag } from '@tamu-gisc/gisday/platform/data-api';
import { EventResponse, EventService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { flatten } from '@nestjs/common';

@Component({
  selector: 'tamu-gisc-event-view',
  templateUrl: './event-view-new.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit, OnDestroy {
  public $events: Observable<Array<Partial<Event>>>;
  public $tags: Observable<Array<Partial<Tag>>>;
  private _$destroy: Subject<boolean> = new Subject();
  public filterTags: string[] = [];

  constructor(private readonly eventService: EventService, private readonly tagService: TagService) {}

  public ngOnInit() {
    this.fetchEvents();
    this.fetchTags();
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public fetchEvents() {
    this.$events = this.eventService.getEvents().pipe(
      // switchMap((events) => events),
      // tap((event) => console.log(event.day)),
      // concatMap(),
      takeUntil(this._$destroy),
      shareReplay(1)
    );
  }

  public fetchTags() {
    this.$tags = this.tagService.getEntities().pipe(takeUntil(this._$destroy), shareReplay(1));
  }

  public applyOrRemoveTag(tag: Tag, checked: boolean) {
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

  /**
   * Returns an observable of Event[] that only contains those Events of the day specified (day 1, day 2, day 3)
   * @param dayNum
   * @returns
   */
  public getDay(dayNum: number) {
    return this.$events.pipe(
      switchMap((events) => events),
      filter((event) => event.day == dayNum),
      toArray()
    );
  }

  public filterEventsByFilterTags(event: Event) {
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
}
