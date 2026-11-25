import {
  Component,
  HostListener,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  inject,
  input,
  output
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, distinctUntilChanged, map, startWith } from 'rxjs';

import { SeasonDay, SimplifiedEvent } from '@tamu-gisc/gisday/platform/data-api';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ParseDateTimeStringsPipe } from '../../../../pipes/parse-date-time-strings/parse-date-time-strings.pipe';
import { CentralDatePipe } from '../../../../pipes/central-date/central-date.pipe';

@Component({
  selector: 'tamu-gisc-event-row',
  templateUrl: './event-row.component.html',
  styleUrls: ['./event-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CheckboxComponent, AsyncPipe, CentralDatePipe, ParseDateTimeStringsPipe]
})
export class EventRowComponent implements OnChanges, OnInit {
  private readonly rt = inject(Router);

  public readonly event = input.required<Partial<SimplifiedEvent>>();

  public readonly day = input.required<Partial<SeasonDay>>();

  /** The day's registered event guids, or null until they have arrived (the card passes them through `async`). */
  public readonly rsvps = input.required<Array<string> | null>();

  public readonly canRegister = input<boolean>(true);

  public readonly rowToggle = output<boolean>();

  public isRsvp$: Observable<boolean>;
  private _rsvps$: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>();

  @HostListener('click', ['$event'])
  public handleRowClick($event: MouseEvent) {
    // Ignore clicks from 'input' elements
    if (($event.target as HTMLElement).tagName !== 'INPUT') {
      this.rt.navigate(['/sessions/details', this.event().guid]);
    }
  }

  public ngOnInit() {
    this.isRsvp$ = this._rsvps$.asObservable().pipe(
      distinctUntilChanged(),
      map((rsvps) => rsvps.some((rsvp) => rsvp === this.event().guid)),
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
