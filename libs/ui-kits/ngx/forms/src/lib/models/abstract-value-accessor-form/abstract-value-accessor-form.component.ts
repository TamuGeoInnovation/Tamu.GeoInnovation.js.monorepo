import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, model } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-abstract-value-accessor-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbstractValueAccessorFormComponent<T> implements ControlValueAccessor {
  private cd = inject(ChangeDetectorRef);

  // Models rather than inputs: the component sets both itself, through the forms API.
  public readonly disabled = model(false);

  // eslint-disable-next-line @angular-eslint/no-input-rename
  private readonly _value = model<T>(undefined, { alias: 'value' });

  public get value() {
    return this.getInternalValue();
  }

  public set value(v: T) {
    this.setInternalValue(v);
  }

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
    this.disabled.set(d);
  }

  // Simple wrappers for children to use to set the value of the component
  // and trigger side effects when they override the value the `value` getters/setters.
  public getInternalValue() {
    return this._value();
  }

  // Simple wrappers for children to use to set the value of the component
  // and trigger side effects when they override the value the `value` getters/setters.
  public setInternalValue(v: T) {
    this._value.set(v === null ? undefined : v);

    this.cd.markForCheck();

    this._onChange(v === null ? undefined : v);
    this._onTouched();
  }
}
