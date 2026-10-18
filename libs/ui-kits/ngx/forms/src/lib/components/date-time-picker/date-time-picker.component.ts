import { AfterViewInit, Component, DestroyRef, forwardRef, ChangeDetectionStrategy, inject, input, model, output, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TooltipComponent, TooltipTriggerComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { DatePipe } from '@angular/common';
import { MATERIAL_ANIMATIONS, provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepicker, MatTimepickerInput } from '@angular/material/timepicker';

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
 * Which native input renders a picker, from the units it offers.
 *
 * A picker whose coarsest unit is the hour picks a time of day; one whose finest unit is the day or
 * coarser picks a date; anything else picks both.
 */
export function inputTypeFor(minView: DateTimePickerView, maxView: DateTimePickerView): 'time' | 'date' | 'datetime-local' {
  if (maxView === 'hour' || maxView === 'minute') {
    return 'time';
  }

  if (minView === 'day' || minView === 'month' || minView === 'year') {
    return 'date';
  }

  return 'datetime-local';
}

const pad = (n: number) => n.toString().padStart(2, '0');

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

/** True for a `Date` that holds an actual moment; false for `null`, a non-date or an invalid `Date`. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/** A `Date` as a native input's value, in local time. Empty for a missing or invalid value. */
export function toInputValue(date: Date, type: ReturnType<typeof inputTypeFor>): string {
  if (!isValidDate(date)) {
    return '';
  }

  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return type === 'time' ? time : type === 'date' ? day : `${day}T${time}`;
}

/**
 * A native input's value as a `Date`, in local time. A time keeps `base`'s date, and a date keeps
 * `base`'s time, so picking one half never loses the other. Returns `null` for an empty or invalid value.
 */
export function fromInputValue(raw: string, type: ReturnType<typeof inputTypeFor>, base: Date): Date | null {
  // A missing or invalid base (a stored time that could not be read, #1772) would make every choice
  // invalid too, so the field could never be corrected. Today stands in for it.
  const result = isValidDate(base) ? new Date(base.getTime()) : startOfToday();

  if (type === 'time') {
    const m = /^(\d{2}):(\d{2})/.exec(raw);

    if (!m) {
      return null;
    }

    result.setHours(+m[1], +m[2], 0, 0);

    return result;
  }

  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(raw);

  if (!m) {
    return null;
  }

  result.setFullYear(+m[1], +m[2] - 1, +m[3]);

  if (type === 'datetime-local' && m[4] !== undefined) {
    result.setHours(+m[4], +m[5], 0, 0);
  }

  return result;
}

/**
 * A date and/or time picker, as a form control.
 *
 * Renders the browser's own date or date-time input inside a tooltip. It wrapped
 * `angular-bootstrap-datetimepicker` until #1220: that library has no Ivy release and only worked because
 * `ngcc` rewrote it, which Angular 16 removes. The inputs and the `changed` output are unchanged.
 *
 * A time of day is Angular Material's time picker instead: a field to type in with the list of times,
 * in steps of `minuteStep`, open beside it. The browser's own time input only offers its list after a
 * second click on a small icon, and in some browsers not at all, which left the GIS Day event form with
 * nothing to choose from (#1747).
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
    // Provided here, not by each application, so that no caller has to change to get the time picker.
    provideNativeDateAdapter(),
    // Without its fade, the list of times leaves the page the moment it closes. With it, the list waits
    // for an animation to end, and that never happens once the tooltip around it has been taken away.
    { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TooltipComponent, TooltipTriggerComponent, DatePipe, MatTimepicker, MatTimepickerInput]
})
export class DateTimePickerComponent implements ControlValueAccessor, AfterViewInit {
  // Get reference for the tooltip component rendered inside this date time picker component.
  //
  // Used to set the visible state of the tooltip content whenever the date time picker component
  // emits a value change.
  private readonly tooltipComponent = viewChild(TooltipComponent);

  // The list of times, when this picker picks a time of day. It exists whether or not the tooltip is
  // open: what a component is handed to project is created with it, and only shown when projected.
  private readonly timepicker = viewChild(MatTimepicker);

  private readonly destroyRef = inject(DestroyRef);

  public ngAfterViewInit() {
    // Opening the picker is what the user asked for, so the list of times opens with it, not after a
    // second click on the field, and goes when it goes. It must not open before then: the list is drawn
    // beside its field, and until the tooltip is open the field is nowhere on the page.
    this.tooltipComponent()
      .tooltipContentVisible.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((visible) => {
        const timepicker = this.timepicker();

        if (!timepicker) {
          return;
        }

        if (visible) {
          timepicker.open();
        } else {
          timepicker.close();
        }
      });
  }

  // A model rather than an input: the component sets it itself, from the user and the forms API.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  private readonly _value = model<Date>(new Date(), { alias: 'value' });

  /**
   * The finest unit offered. `day` or coarser picks a date only.
   */
  public readonly minView = input<DateTimePickerView>('minute');

  /**
   * The coarsest unit offered. `hour` picks a time of day only.
   */
  public readonly maxView = input<DateTimePickerView>('month');

  /**
   * Accepted for compatibility with existing templates. The native input always opens on its own view.
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

  public get inputType() {
    return inputTypeFor(this.minView(), this.maxView());
  }

  public get inputValue() {
    return toInputValue(this._value(), this.inputType);
  }

  /**
   * The value as the time picker reads it. The same `Date` between changes: a new object on every read
   * would look like a new value to the picker each time the view is checked.
   */
  public get timeValue() {
    const value = this._value();

    return isValidDate(value) ? value : null;
  }

  /** How far apart the offered times are, as Angular Material's time picker takes it. */
  public get interval() {
    return `${this.minuteStep()}min`;
  }

  /** The native input's step, in seconds. Dates step by day, which is the input's default. */
  public get step() {
    return this.inputType === 'date' ? undefined : this.minuteStep() * 60;
  }

  private _onChange = (v) => {
    return v;
  };

  private _onTouched = () => {
    return;
  };

  public handleInputChange(raw: string) {
    const picked = fromInputValue(raw, this.inputType, this._value());

    if (picked === null) {
      return;
    }

    this.value = picked;

    this.tooltipComponent().isVisible.set(false);

    this.changed.emit(new DateTimePickerChange(picked));
  }

  /**
   * A time chosen from the list or typed into the field. Only its hours and minutes are taken: the
   * time picker knows nothing of the date this value belongs to.
   */
  public handleTimePicked(picked: Date | null) {
    const value = this._value();
    const current = isValidDate(value) ? value : null;

    if (!isValidDate(picked) || (current && picked.getHours() === current.getHours() && picked.getMinutes() === current.getMinutes())) {
      return;
    }

    // Built on the current value's date, or today's when there is no valid value to build on (#1772).
    const next = current ? new Date(current.getTime()) : startOfToday();
    next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);

    this.value = next;

    this.changed.emit(new DateTimePickerChange(next));
  }

  /**
   * The list of times and the tooltip go together: once the list has closed, on a choice, Enter, Escape
   * or a click elsewhere, a tooltip holding only the field has nothing left to offer.
   */
  public close() {
    this.tooltipComponent().isVisible.set(false);
  }

  public writeValue(v) {
    this.value = v;
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }
}
