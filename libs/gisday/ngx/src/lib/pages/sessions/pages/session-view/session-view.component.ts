import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { find, map, shareReplay, takeUntil } from 'rxjs/operators';

import { Tag } from '@tamu-gisc/gisday/data-api';
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

  public toggleFilters() {}
}

// .pipe(
//   debounceTime(1000),
//   takeUntil(this._$destroy)
// )
