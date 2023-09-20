import { Component, Input, forwardRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DlDateTimePickerChange, DlDateTimePickerComponent } from 'angular-bootstrap-datetimepicker';

import { TooltipComponent } from '@tamu-gisc/ui-kits/ngx/layout';

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
  ]
})
export class DateTimePickerComponent<D> implements ControlValueAccessor {
  // Get reference for the tooltip component rendered inside this date time picker component.
  //
  // Used to set the visible state of the tooltip content whenever the date time picker component
  // emits a value change.
  @ViewChild(TooltipComponent, { static: true })
  private tooltipComponent: TooltipComponent;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value')
  private _value: Date = new Date();

  @Input()
  public minView: DlDateTimePickerComponent<D>['minView'] = 'minute';

  @Input()
  public maxView: DlDateTimePickerComponent<D>['maxView'] = 'month';

  @Input()
  public startView: DlDateTimePickerComponent<D>['startView'] = 'day';

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

  @Output()
  public changed: EventEmitter<DlDateTimePickerChange<Date>> = new EventEmitter();

  public get value() {
    return new Date(this._value.getTime());
  }

  public set value(v) {
    this._value = new Date(v.getTime());
    this._onChange(new Date(v.getTime()));
    this._onTouched();
  }

  private _onChange = (v) => {
    return v;
  };

  private _onTouched = () => {
    return;
  };

  public handleDlTimePickerChange(event: DlDateTimePickerChange<Date>) {
    this.value = event.value;

    this.tooltipComponent.isVisible = false;

    this.changed.emit(event);
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
