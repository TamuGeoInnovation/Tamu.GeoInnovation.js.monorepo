import { AfterViewInit, Component, DestroyRef, forwardRef, inject, input, model, output, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TooltipComponent, TooltipTriggerComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { DatePipe } from '@angular/common';
import { MATERIAL_ANIMATIONS, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatTimepicker, MatTimepickerInput, MatTimepickerToggle } from '@angular/material/timepicker';

/**
 * The finest and coarsest units a picker offers, in the vocabulary of the library this component used
 * to wrap (`angular-bootstrap-datetimepicker`), kept so its callers did not have to change.
 */
export type DateTimePickerView = 'year' | 'month' | 'day' | 'hour' | 'minute';

/**
 * Emitted when the picked value changes. A class rather than an interface so callers can still tell it
 * apart from a plain `Date` with `instanceof`, as the trip planner does.
 */
export class DateTimePickerChange<D = Date> {
  constructor(public readonly value: D) {}
}

/**
 * What a picker picks, from the units it offers.
 *
 * A picker whose coarsest unit is the hour picks a time of day; one whose finest unit is the day or
 * coarser picks a date; anything else picks both.
 */
export function pickerKindFor(minView: DateTimePickerView, maxView: DateTimePickerView): 'time' | 'date' | 'date-time' {
  if (maxView === 'hour' || maxView === 'minute') {
    return 'time';
  }

  if (minView === 'day' || minView === 'month' || minView === 'year') {
    return 'date';
  }

  return 'date-time';
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

/** True for a `Date` that holds an actual moment; false for `null`, a non-date or an invalid `Date`. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * `picked`'s day with `base`'s time of day, in local time. A missing or invalid base (a stored time that could
 * not be read, #1772) leaves midnight, so the field can still be corrected.
 */
export function withDate(base: Date | null, picked: Date): Date {
  const next = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());

  if (isValidDate(base)) {
    next.setHours(base.getHours(), base.getMinutes(), 0, 0);
  }

  return next;
}

/**
 * `base`'s day with `picked`'s hours and minutes, in local time. A missing or invalid base takes today's date
 * (#1772): the time picker knows nothing of the date a time belongs to.
 */
export function withTime(base: Date | null, picked: Date): Date {
  const next = isValidDate(base) ? new Date(base.getTime()) : startOfToday();
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);

  return next;
}

/**
 * A date and/or time picker, as a form control.
 *
 * Inside a tooltip, a date is Angular Material's date field with its calendar, and a time is its time field
 * with the list of times in steps of `minuteStep`. Each can be typed or chosen, and takes effect when it is
 * complete: when a date or time is chosen, or a typed one is left or entered, never on a single key.
 *
 * Until #2583 a date and time was the browser's own `datetime-local` box, which reports a change on every key
 * once it holds a whole value, and the picker closed on the first: typing "30" into the minutes kept only the
 * 3, and setting the VGI scoring window took four saves. Before #1220 it wrapped
 * `angular-bootstrap-datetimepicker`, whose inputs and `changed` output it keeps, so no caller had to change.
 */
@Component({
  selector: 'tamu-gisc-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    },
    // Provided here, not by each application, so that no caller has to change to get the pickers.
    provideNativeDateAdapter(),
    // Without their fade, the calendar and the list of times leave the page the moment they close. With it,
    // they wait for an animation to end, and that never happens once the tooltip around them has been taken away.
    { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }
  ],
  imports: [
    TooltipComponent,
    TooltipTriggerComponent,
    DatePipe,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerToggle
  ]
})
export class DateTimePickerComponent implements ControlValueAccessor, AfterViewInit {
  // Get reference for the tooltip component rendered inside this date time picker component.
  //
  // Used to set the visible state of the tooltip content whenever the date time picker component
  // emits a value change.
  // Required: the tooltip is the root of the template, never behind an @if (#3495).
  private readonly tooltipComponent = viewChild.required(TooltipComponent);

  // The calendar and the list of times. Each exists whether or not the tooltip is open: what a component is
  // handed to project is created with it, and only shown when projected.
  private readonly datepicker = viewChild(MatDatepicker);
  private readonly timepicker = viewChild(MatTimepicker);

  private readonly destroyRef = inject(DestroyRef);

  public ngAfterViewInit() {
    // A picker of one thing opens its calendar or its list of times with it, not after a second click, and
    // closes it when it goes. It must not open before then: either is drawn beside its field, and until the
    // tooltip is open the field is nowhere on the page. A picker of both opens neither: which comes first is
    // the user's choice.
    this.tooltipComponent()
      .tooltipContentVisible.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((visible) => {
        const kind = this.kind;

        if (visible) {
          if (kind === 'time') {
            this.timepicker()?.open();
          } else if (kind === 'date') {
            this.datepicker()?.open();
          }
        } else {
          this.datepicker()?.close();
          this.timepicker()?.close();
        }
      });
  }

  // A model rather than an input: the component sets it itself, from the user and the forms API.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  protected readonly _value = model<Date | null>(new Date(), { alias: 'value' });

  /**
   * The finest unit offered. `day` or coarser picks a date only.
   */
  public readonly minView = input<DateTimePickerView>('minute');

  /**
   * The coarsest unit offered. `hour` picks a time of day only.
   */
  public readonly maxView = input<DateTimePickerView>('month');

  /**
   * Accepted for compatibility with existing templates. The calendar always opens on its month.
   */
  public readonly startView = input<DateTimePickerView>('day');

  /**
   * Defaults to `5`
   */
  public readonly minuteStep = input(5);

  /**
   * The format string used to display the date time picker value.
   *
   * This value will be passed directly to the date pipe.
   */
  public readonly formatString = input('medium');

  /**
   * Whether to show the icon in the date time picker input.
   */
  public readonly showIcon = input(true);

  /**
   * Material icon name to display in the date time picker input.
   */
  public readonly iconName = input('calendar_today');

  public readonly changed = output<DateTimePickerChange<Date>>();

  public get value() {
    const value = this._value();

    return isValidDate(value) ? new Date(value.getTime()) : null;
  }

  public set value(v) {
    this._value.set(isValidDate(v) ? new Date(v.getTime()) : null);
    this._onChange(this.value);
    this._onTouched();
  }

  public get kind() {
    return pickerKindFor(this.minView(), this.maxView());
  }

  /**
   * The value as the date and time fields read it. The same `Date` between changes: a new object on every read
   * would look like a new value to them each time the view is checked.
   */
  public get fieldValue() {
    const value = this._value();

    return isValidDate(value) ? value : null;
  }

  /** How far apart the offered times are, as Angular Material's time picker takes it. */
  public get interval() {
    return `${this.minuteStep()}min`;
  }

  private _onChange = (v) => {
    return v;
  };

  private _onTouched = () => {
    return;
  };

  /**
   * A date chosen from the calendar, or typed and then left or entered. It keeps the time already set. An emptied
   * field clears the value: the form is told, and `changed`, which carries a date, is not emitted.
   */
  public handleDatePicked(picked: Date | null) {
    const current = this.fieldValue;

    if (picked === null) {
      if (current !== null) {
        this.value = null;
      }

      return;
    }

    if (!isValidDate(picked)) {
      return;
    }

    const next = withDate(current, picked);

    if (current && next.getTime() === current.getTime()) {
      return;
    }

    this.value = next;

    this.changed.emit(new DateTimePickerChange(next));
  }

  /**
   * A time chosen from the list or typed into the field. Only its hours and minutes are taken: the time picker
   * knows nothing of the date this value belongs to.
   */
  public handleTimePicked(picked: Date | null) {
    const current = this.fieldValue;

    if (
      !isValidDate(picked) ||
      (current && picked.getHours() === current.getHours() && picked.getMinutes() === current.getMinutes())
    ) {
      return;
    }

    const next = withTime(current, picked);

    this.value = next;

    this.changed.emit(new DateTimePickerChange(next));
  }

  /**
   * A picker of one thing goes with its calendar or list: once that has closed, on a choice, Enter, Escape or a
   * click elsewhere, a tooltip holding only the field has nothing left to offer. A picker of both goes when its
   * list of times closes, the second of its two steps; after a date it stays, for the time.
   */
  public pickerClosed(which: 'date' | 'time') {
    const kind = this.kind;

    if (kind === which || (kind === 'date-time' && which === 'time')) {
      this.tooltipComponent().isVisible.set(false);
    }
  }

  /**
   * Shows a value from the form without reporting it back as a change or a touch: a form loaded with a record would
   * otherwise count as changed the moment it opened (#2964).
   */
  public writeValue(v) {
    this._value.set(isValidDate(v) ? new Date(v.getTime()) : null);
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }
}
