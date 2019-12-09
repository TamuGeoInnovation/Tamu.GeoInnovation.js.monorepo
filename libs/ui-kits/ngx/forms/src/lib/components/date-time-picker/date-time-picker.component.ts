import { Component, Input, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

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
export class DateTimePickerComponent implements ControlValueAccessor {
  // Get reference for the tooltip component rendered inside this date time picker component.
  //
  // Used to set the visible state of the tooltip content whenever the date time picker component
  // emits a value change.
  @ViewChild(TooltipComponent, { static: true })
  private tooltipComponent: TooltipComponent;

  // tslint:disable-next-line:no-input-rename
  @Input('value')
  private _value: Date = new Date();

  public get value() {
    return new Date(this._value.getTime());
  }

  public set value(v) {
    this._value = new Date(v.getTime());
    this._onChange(new Date(v.getTime()));
    this._onTouched();
  }

  constructor() {}

  private _onChange = (v) => {};
  private _onTouched = () => {};

  public handleDlTimePickerChange(event: DlDateTimePickerChange<Date>) {
    this.value = event.value;

    this.tooltipComponent.isVisible = false;
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
