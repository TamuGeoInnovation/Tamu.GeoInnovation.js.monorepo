import { Component, OnInit, Input, forwardRef } from '@angular/core';
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
export class RadioGroupComponent<T extends object, V> implements ControlValueAccessor, OnInit {
  @Input()
  public options: Array<T>;

  // tslint:disable-next-line: no-input-rename
  @Input('value')
  private _value = undefined;

  public set value(v) {
    this._value = v;
    this._onChange(v);
    this._onTouch();
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

  constructor() {}

  private _onChange = (v) => {};
  private _onTouch = () => {};

  public ngOnInit() {}

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouch = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  public writeValue(value: V) {
    this.value = value;
  }

  public renderTemplate(option: T, path: string) {
    if (path) {
      return getPropertyValue(option, path);
    } else {
      return option;
    }
  }

  public evaluateSetValue(option: T) {
    if (this.disabled === false) {
      const value = this.renderTemplate(option, this.valuePath);

      this.value = value;
    }
  }
}
