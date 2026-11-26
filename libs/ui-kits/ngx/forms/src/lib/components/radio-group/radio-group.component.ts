import { Component, forwardRef, ChangeDetectionStrategy, input, model } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tamu-gisc-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  host: { role: 'radiogroup' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass]
})
export class RadioGroupComponent<Option extends object, Value> implements ControlValueAccessor {
  public readonly options = input<Array<Option> | undefined>(undefined);

  /**
   * INTERNAL USE ONLY. Use `value` getter/setter instead.
   *
   * A model rather than an input: the component sets it itself, from the user and the forms API.
   * Callers set the value through the forms API; none binds `[value]`.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  // What the valuePath picks from the chosen option, or the option itself without one (#3633).
  public readonly _value = model<Value | Option | undefined>(undefined, { alias: 'value' });

  public set value(v) {
    this._value.set(v);

    this.onInitialValue(v);
  }

  public get value() {
    return this._value();
  }

  // A model rather than an input: the forms API sets it.
  public readonly disabled = model(false);

  public readonly displayPath = input<string | undefined>(undefined);

  public readonly valuePath = input<string | undefined>(undefined);

  /**
   * Hook that can be used to execute an operation after the first value has been set.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInitialValue(v: Value | Option | undefined) {
    return;
  }

  public onChange: (value: Value | Option | undefined) => void = (v) => {
    return v;
  };

  public onTouch = () => {
    return;
  };

  public registerOnChange(fn: (value: Value | Option | undefined) => void) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }

  public writeValue(value: Value | Option | undefined) {
    this.value = value;
  }

  public renderTemplate(option: Option, path: string | undefined): Value | Option {
    if (path) {
      return getPropertyValue<Value>(option, path);
    } else {
      return option;
    }
  }

  public evaluateSetValue(option: Option): Value | Option | undefined {
    let value: Value | Option | undefined;

    if (this.disabled() === false) {
      value = this.renderTemplate(option, this.valuePath());

      this.value = value;

      this.onTouch();
      this.onChange(value);
    }

    return value;
  }
}
