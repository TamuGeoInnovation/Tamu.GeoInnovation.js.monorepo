import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable, from, of, merge, Subject, AsyncSubject } from 'rxjs';
import { switchMap, map, filter, mergeAll, mergeMap, concat, toArray, groupBy } from 'rxjs/operators';
import { shareReplay } from 'rxjs/operators';

import { Event } from '@tamu-gisc/gisday/nest';
import { SessionsService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit, OnDestroy {
  public $events: Observable<Array<Partial<Event>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly sessionService: SessionsService) {
    this.fetchEvents();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEvents() {
    this.sessionService
      .getEvents()
      .pipe(shareReplay(1))
      .subscribe((events) => {
        console.log(events);
      });
  }
}

// .pipe(
//   debounceTime(1000),
//   takeUntil(this._$destroy)
// )
