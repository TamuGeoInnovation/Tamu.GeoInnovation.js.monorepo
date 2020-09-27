import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { find, map, shareReplay, takeUntil } from 'rxjs/operators';

import { Event, Tag } from '@tamu-gisc/gisday/data-api';
import { EventResponse, SessionsService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.scss']
})
export class SessionViewComponent implements OnInit, OnDestroy {
  public $events: Observable<Partial<EventResponse>>;
  public $tags: Observable<Array<Partial<Tag>>>;
  private _$destroy: Subject<boolean> = new Subject();
  public filterTags: string[] = [];

  constructor(private readonly sessionService: SessionsService) {
    this.fetchEvents();
    this.fetchTags();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEvents() {
    this.$events = this.sessionService.getEventsByDay().pipe(
      takeUntil(this._$destroy),
      shareReplay(1)
    );
  }

  public fetchTags() {
    this.$tags = this.sessionService.getTags().pipe(
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
    this.fetchEvents();
  }

  public filterEventsByFilterTags(event: Event) {
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

// .pipe(
//   debounceTime(1000),
//   takeUntil(this._$destroy)
// )
