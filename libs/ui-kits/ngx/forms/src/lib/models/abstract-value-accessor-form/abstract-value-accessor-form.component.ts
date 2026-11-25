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
  protected readonly _value = model<T | undefined>(undefined, { alias: 'value' });

  public get value() {
    return this.getInternalValue();
  }

  // A form writes null when it is reset or empty, and the value is kept as undefined (#3495).
  public set value(v: T | null | undefined) {
    this.setInternalValue(v);
  }

  private _onChange = (v: T | undefined) => {
    return v;
  };

  private _onTouched = () => {
    return;
  };

  /** While the form is writing a value in, which is not a change to report back to it (#2964). */
  private _writing = false;

  /**
   * Takes a value from the form, through the `value` setter so a child's side effects still run, without reporting it
   * back as a change or a touch: the form would count as changed the moment a page loaded a record into it (#2964).
   */
  public writeValue(v: T | null | undefined) {
    this._writing = true;

    try {
      this.value = v;
    } finally {
      this._writing = false;
    }
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
  public setInternalValue(v: T | null | undefined) {
    this._value.set(v === null ? undefined : v);

    this.cd.markForCheck();

    if (this._writing) {
      return;
    }

    this._onChange(v === null ? undefined : v);
    this._onTouched();
  }

  /**
   * For a control whose value is an object, such as a link with a label and an address: sets one of its fields on a new
   * object, so the form hears of the user's change. Editing the object the form gave it in place changed the form's
   * value without telling it, so the form never counted as changed and Escape left without asking (#3007).
   */
  public setInternalProperty<K extends keyof T>(key: K, v: T[K]) {
    this.setInternalValue({ ...this.getInternalValue(), [key]: v } as T);
  }
}
