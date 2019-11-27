import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

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
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  @ViewChild('checkboxInput', { static: true }) public ref: ElementRef;

  /**
   * Determines the checked state of the checkbox ref element.
   *
   * Defaults to `false`.
   */
  // tslint:disable-next-line:no-input-rename
  @Input('checked')
  private _checked = false;

  public get checked() {
    return this._checked;
  }

  public set checked(c) {
    this._checked = c;
    this._onChange(c);
    this._onTouch();
    this.changed.emit(c);
  }

  /**
   * **Optional** on single checkbox components.
   *
   * **REQUIRED** on checkbox groups, where a property in this object is referenced and used to create a composite
   * value of selected items in the list.
   *
   *
   * @type {(string | number | boolean)}
   */
  @Input()
  public data: object;

  /**
   * Determines the interaction state of the component, preventing or allowing user input.
   * `true` disables inputs and changes style to reflect.
   *
   * Defaults to `false`.
   */
  @Input()
  public disabled = false;

  /**
   * Populates the aria-label attribute property.
   *
   * Defaults to "Checkbox input".
   */
  @Input()
  public ariaLabel = 'Checkbox input';

  /**
   * Populates the checkbox label property.
   *
   * Defaults to "Checkbox".
   */
  @Input()
  public label = 'Checkbox';

  @Input()
  public description = '';

  /**
   * Populates the form name properties on the label and input elements.
   *
   * Defaults to "checkbox".
   */
  @Input()
  public name = 'checkbox';

  /**
   * Output event emitter, used to bubble up the event value to the parent component.
   */
  @Output()
  public changed: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  private _onChange = (v) => {};
  private _onTouch = () => {};

  /**
   * Mouse event handler, emitting the raw checked value of the reference checkbox
   *
   * @memberof CheckboxComponent
   */
  public handleMouseEvent(): void {
    this.checked = !this._checked;
  }

  /**
   * Keyboard event handler, emitting the inverse value of the reference checkbox due
   * to the fact that keyboard events do not interact directly with the input box.
   *
   * @memberof CheckboxComponent
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
    this.disabled = disabled;
  }

  /**
   * **FOR INTERNAL USE ONLY**
   *
   * Sets value without calling the Forms API or emitting a `changed` event.
   */
  public _setValueNoEmit(value: boolean) {
    this._checked = value;
  }
}
