import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { Event } from '@tamu-gisc/gisday/data-api';
import { SessionsService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit, OnDestroy {
  public $events: Observable<Array<Partial<Event>>>;
  public subDay1: Observable<Event>;
  public subDay2: Observable<Event>;
  public subDay3: Observable<Event>;
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
