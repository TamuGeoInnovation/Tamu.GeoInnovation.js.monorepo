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
  private _value: T | undefined = undefined;

  public get value(): T | undefined {
    return this.getInternalValue();
  }

  public set value(v: T | undefined) {
    this.setInternalValue(v);
  }

  constructor(private cd: ChangeDetectorRef) {}

  private _onChange: (v: T | undefined) => void = (v: T | undefined) => {
    return;
  };

  private _onTouched: () => void = () => {
    return;
  };

  public writeValue(v: T | undefined) {
    this.value = v;
  }

  public registerOnChange(fn: (v: T | undefined) => void) {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  public setDisabledState(d: boolean) {
    this.disabled = d;
  }

  // Simple wrappers for children to use to set the value of the component
  // and trigger side effects when they override the value the `value` getters/setters.
  public getInternalValue(): T | undefined {
    return this._value;
  }

  // Simple wrappers for children to use to set the value of the component
  // and trigger side effects when they override the value the `value` getters/setters.
  public setInternalValue(v: T | undefined) {
    this._value = v === null ? undefined : v;

    this.cd.markForCheck();

    this._onChange(v === null ? undefined : v);
    this._onTouched();
  }
}
