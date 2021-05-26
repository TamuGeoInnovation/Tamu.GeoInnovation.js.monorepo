import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { shareReplay, takeUntil } from 'rxjs/operators';

import { Event, Tag } from '@tamu-gisc/gisday/data-api';
import { EventResponse, EventService, TagService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit, OnDestroy {
  public $events: Observable<Partial<EventResponse>>;
  public $tags: Observable<Array<Partial<Tag>>>;
  private _$destroy: Subject<boolean> = new Subject();
  public filterTags: string[] = [];

  constructor(private readonly eventService: EventService, private readonly tagService: TagService) {
    this.fetchEvents();
    this.fetchTags();
  }

  public ngOnInit() {}

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEvents() {
    this.$events = this.eventService.getEventsByDay().pipe(
      takeUntil(this._$destroy),
      shareReplay(1)
    );
  }

  public fetchTags() {
    this.$tags = this.tagService.getEntities().pipe(
      takeUntil(this._$destroy),
      shareReplay(1)
    );
  }

  public applyOrRemoveTag(tag: Tag, checked: boolean) {
    if (checked) {
      // add to filterTags
      this.filterTags.push(tag.name);
    } else {
      // remove from filterTags
      this.filterTags = this.filterTags.filter((value, index) => {
        if (value !== tag.name) {
          return value;
        }
      });
    }
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
