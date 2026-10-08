import { Component, Input, forwardRef, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TooltipComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TooltipComponent as TooltipComponent_1 } from '../../../../../layout/src/lib/components/tooltip/tooltip.component';
import { TooltipTriggerComponent } from '../../../../../layout/src/lib/components/tooltip/components/tooltip-trigger/tooltip-trigger.component';
import { DatePipe } from '@angular/common';

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

/** A `Date` as a native input's value, in local time. */
export function toInputValue(date: Date, type: ReturnType<typeof inputTypeFor>): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return type === 'time' ? time : type === 'date' ? day : `${day}T${time}`;
}

/**
 * A native input's value as a `Date`, in local time. A time keeps `base`'s date, and a date keeps
 * `base`'s time, so picking one half never loses the other. Returns `null` for an empty or invalid value.
 */
export function fromInputValue(raw: string, type: ReturnType<typeof inputTypeFor>, base: Date): Date | null {
  const result = new Date(base.getTime());

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
 * Renders the browser's own date, time or date-time input inside a tooltip. It wrapped
 * `angular-bootstrap-datetimepicker` until #1220: that library has no Ivy release and only worked because
 * `ngcc` rewrote it, which Angular 16 removes. The inputs and the `changed` output are unchanged.
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
        }
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TooltipComponent_1, TooltipTriggerComponent, DatePipe]
})
export class DateTimePickerComponent implements ControlValueAccessor {
  // Get reference for the tooltip component rendered inside this date time picker component.
  //
  // Used to set the visible state of the tooltip content whenever the date time picker component
  // emits a value change.
  @ViewChild(TooltipComponent, { static: true })
  private tooltipComponent: TooltipComponent;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value')
  private _value: Date = new Date();

  /**
   * The finest unit offered. `day` or coarser picks a date only.
   */
  @Input()
  public minView: DateTimePickerView = 'minute';

  /**
   * The coarsest unit offered. `hour` picks a time of day only.
   */
  @Input()
  public maxView: DateTimePickerView = 'month';

  /**
   * Accepted for compatibility with existing templates. The native input always opens on its own view.
   */
  @Input()
  public startView: DateTimePickerView = 'day';

  /**
   * Defaults to `5`
   */
  @Input()
  public minuteStep = 5;

  /**
   * The format string used to display the date time picker value.
   *
   * This value will be passed directly to the date pipe.
   */
  @Input()
  public formatString = 'medium';

  /**
   * Whether to show the icon in the date time picker input.
   */
  @Input()
  public showIcon = true;

  /**
   * Material icon name to display in the date time picker input.
   */
  @Input()
  public iconName = 'calendar_today';

  @Output()
  public changed: EventEmitter<DateTimePickerChange<Date>> = new EventEmitter();

  public get value() {
    return new Date(this._value.getTime());
  }

  public set value(v) {
    this._value = new Date(v.getTime());
    this._onChange(new Date(v.getTime()));
    this._onTouched();
  }

  public get inputType() {
    return inputTypeFor(this.minView, this.maxView);
  }

  public get inputValue() {
    return toInputValue(this._value, this.inputType);
  }

  /** The native input's step, in seconds. Dates step by day, which is the input's default. */
  public get step() {
    return this.inputType === 'date' ? undefined : this.minuteStep * 60;
  }

  private _onChange = (v) => {
    return v;
  };

  private _onTouched = () => {
    return;
  };

  public handleInputChange(raw: string) {
    const picked = fromInputValue(raw, this.inputType, this._value);

    if (picked === null) {
      return;
    }

    this.value = picked;

    this.tooltipComponent.isVisible = false;

    this.changed.emit(new DateTimePickerChange(picked));
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
