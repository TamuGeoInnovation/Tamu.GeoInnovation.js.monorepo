import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
  inject,
  input
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, distinctUntilChanged, map, startWith } from 'rxjs';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ParseDateTimeStringsPipe } from '../../../../pipes/parse-date-time-strings/parse-date-time-strings.pipe';

@Component({
  selector: 'tamu-gisc-event-row',
  templateUrl: './event-row.component.html',
  styleUrls: ['./event-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CheckboxComponent, AsyncPipe, DatePipe, ParseDateTimeStringsPipe]
})
export class EventRowComponent implements OnChanges, OnInit {
  private readonly rt = inject(Router);

  @Input()
  public event: Partial<SimplifiedEvent>;

  @Input()
  public day: Partial<SeasonDay>;

  public readonly rsvps = input<Array<string>>(undefined);

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
