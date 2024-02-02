import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, distinctUntilChanged, map, startWith } from 'rxjs';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-event-row',
  templateUrl: './event-row.component.html',
  styleUrls: ['./event-row.component.scss']
})
export class EventRowComponent implements OnChanges, OnInit {
  @Input()
  public event: Partial<SimplifiedEvent>;

  @Input()
  public day: Partial<SeasonDay>;

  @Input()
  public rsvps: Array<string>;

  @Output()
  public rowToggle: EventEmitter<boolean> = new EventEmitter();

  public isRsvp$: Observable<boolean>;
  private _rsvps$: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>();

  @HostListener('click', ['$event'])
  public handleRowClick($event: MouseEvent) {
    // Ignore clicks from 'input' elements
    if (($event.target as HTMLElement).tagName !== 'INPUT') {
      this.rt.navigate(['/sessions/details', this.event.guid]);
    }
  }

  constructor(private readonly rt: Router) {}

  public ngOnInit() {
    this.isRsvp$ = this._rsvps$.asObservable().pipe(
      distinctUntilChanged(),
      map((rsvps) => rsvps.some((rsvp) => rsvp === this.event.guid)),
      startWith(false)
    );
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.rsvps && changes.rsvps.currentValue !== null) {
      this._rsvps$.next(changes.rsvps.currentValue);
    }
  }

  public emitToggleEvent(newState: boolean) {
    this.rowToggle.emit(newState);
  }
}
