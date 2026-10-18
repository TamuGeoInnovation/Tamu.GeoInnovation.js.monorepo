import { Component, ElementRef, forwardRef, ChangeDetectionStrategy, input, model, output, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tamu-gisc-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass]
})
export class CheckboxComponent implements ControlValueAccessor {
  public readonly ref = viewChild<ElementRef>('checkboxInput');

  /**
   * Determines the checked state of the checkbox ref element.
   *
   * Defaults to `false`.
   */

  // A model rather than an input: the component sets it itself, from the user and the forms API.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  private readonly _checked = model(false, { alias: 'checked' });

  public get checked() {
    return this._checked();
  }

  public set checked(c) {
    this._checked.set(c);
    this._onChange(c);
    this._onTouch();
    this.changed.emit(c);
  }

  /**
   * **Optional** on single checkbox components.
   *
   * **REQUIRED** on checkbox groups, where a property in this object is referenced and used to create a composite
   * value of selected items in the list.
   */
  public readonly data = input<object>(undefined);

  /**
   * Determines the interaction state of the component, preventing or allowing user input.
   * `true` disables inputs and changes style to reflect.
   *
   * Defaults to `false`.
   */
  public readonly disabled = model(false);

  /**
   * Populates the aria-label attribute property.
   *
   * Defaults to "Checkbox input".
   */
  public readonly ariaLabel = input('Checkbox input');

  /**
   * Populates the checkbox label property.
   *
   * Defaults to "Checkbox".
   */
  public readonly label = input('Checkbox');

  public readonly description = input('');

  /**
   * Populates the form name properties on the label and input elements.
   *
   * Defaults to "checkbox".
   */
  public readonly name = input('checkbox');

  /**
   * Output event emitter, used to bubble up the event value to the parent component.
   */
  public readonly changed = output<boolean>();

  private _onChange = (v) => {
    return v;
  };

  private _onTouch = () => {
    return;
  };

  /**
   * Mouse event handler, emitting the raw checked value of the reference checkbox
   */
  public handleMouseEvent(): void {
    this.checked = !this._checked();
  }

  /**
   * Keyboard event handler, emitting the inverse value of the reference checkbox due
   * to the fact that keyboard events do not interact directly with the input box.
   */
  public handleKeyboardEvent(): void {
    this.checked = !this.checked;
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouch = fn;
  }

  public writeValue(val) {
    this.checked = val;
  }

  public setDisabledState(disabled?: boolean) {
    this.disabled.set(disabled);
  }

  /**
   * **FOR INTERNAL USE ONLY**
   *
   * Sets value without calling the Forms API or emitting a `changed` event.
   */
  public _setValueNoEmit(value: boolean) {
    this._checked.set(value);
  }
}
