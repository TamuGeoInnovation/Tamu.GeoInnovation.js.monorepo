import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { getPropertyValue } from '@tamu-gisc/common/utils/object';

@Component({
  selector: 'tamu-gisc-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true
    }
  ]
})
export class RadioGroupComponent<Option extends object, Value> implements ControlValueAccessor {
  @Input()
  public options: Array<Option>;

  /**
   * INTERNAL USE ONLY. Use `value` getter/setter instead.
   */
  public _value = undefined;

  @Input()
  public set value(v) {
    this._value = v;

    this.onInitialValue(v);
  }

  public get value() {
    return this._value;
  }

  @Input()
  public disabled = false;

  @Input()
  public displayPath: string;

  @Input()
  public valuePath: string;

  /**
   * Hook that can be used to execute an operation after the first value has been set.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInitialValue(v: Value) {
    return;
  }

  public onChange = (v) => {
    return v;
  };

  public onTouch = () => {
    return;
  };

  public registerOnChange(fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouch = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  public writeValue(value: Value) {
    this.value = value;
  }

  public renderTemplate(option: Option, path: string) {
    if (path) {
      return getPropertyValue(option, path);
    } else {
      return option;
    }
  }

  public evaluateSetValue(option: Option) {
    let value;

    if (this.disabled === false) {
      value = this.renderTemplate(option, this.valuePath);

      this.value = value;

      this.onTouch();
      this.onChange(value);
    }

    return value;
  }
}
