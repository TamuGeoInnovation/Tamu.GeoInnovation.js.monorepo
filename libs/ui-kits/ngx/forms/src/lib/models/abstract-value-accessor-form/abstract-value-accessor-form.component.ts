import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-abstract-value-accessor-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbstractValueAccessorFormComponent<T> implements ControlValueAccessor {
  @Input()
  public disabled = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value')
  private _value: T = undefined;

  public get value() {
    return this._value;
  }

  public set value(v: T) {
    this._value = v === null ? undefined : v;

    this.cd.markForCheck();
  }

  constructor(private cd: ChangeDetectorRef) {}

  private _onChange = (v: T) => {
    return v;
  };

  private _onTouched = () => {
    return;
  };

  public writeValue(v: T) {
    this.value = v;
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }

  public setDisabledState(d: boolean) {
    this.disabled = d;
  }
}
