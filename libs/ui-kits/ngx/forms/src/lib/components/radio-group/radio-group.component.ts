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
  public _value: Value | undefined = undefined;

  @Input()
  public set value(v: Value | undefined) {
    this._value = v;

    if (v !== undefined) {
      this.onInitialValue(v);
    }
  }

  public get value(): Value | undefined {
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

  public onChange: (v: Value | undefined) => void = (v: Value | undefined) => {
    return;
  };

  public onTouch: () => void = () => {
    return;
  };

  public registerOnChange(fn: (v: Value | undefined) => void) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  public writeValue(value: Value | undefined) {
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
    let value: Value | undefined;

    if (this.disabled === false) {
      value = this.renderTemplate(option, this.valuePath) as Value;

      this.value = value;

      this.onTouch();
      this.onChange(value);
    }

    return value;
  }
}
