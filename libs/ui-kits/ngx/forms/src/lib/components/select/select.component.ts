import { Component, ChangeDetectionStrategy, forwardRef, ChangeDetectorRef, inject, input, model, output } from '@angular/core';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tamu-gisc-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgClass]
})
export class SelectComponent<T extends object> implements ControlValueAccessor {
  private cd = inject(ChangeDetectorRef);

  /**
   * Functions as the initial/default or state value of the select element.
   *
   * If no `model` is provided from the parent, the placeholder is automatically selected.
   *
   * A model rather than an input: the component sets it itself, from the user and the forms API.
   *
   * The property of the chosen item named by `valueTemplate`, or the item itself without one: the layer filter
   * takes the whole field (#2256).
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  protected readonly _value = model<T | string>(undefined, { alias: 'value' });

  public readonly formControlName = input('default');

  public readonly floatLabel = input(false);

  public get value() {
    return this._value();
  }

  public set value(value: T | string) {
    this._value.set(value === null || value === undefined || value === ('undefined' as unknown) ? undefined : value);
    this._onChange(value === null || value === undefined || value === ('undefined' as unknown) ? undefined : value);
    this._onTouched();
    this.cd.markForCheck();
  }

  /**
   * Iterable data collection that will be used to generate the drop-down options.
   */
  public readonly data = input<T[]>(undefined);

  /**
   * Dot-notation string representing the evaluated property used in the display of the option element.
   */
  public readonly displayTemplate = input<string>(undefined);

  /**
   * Dot-notation string representing the evaluated property used in the option data model.
   */
  public readonly valueTemplate = input<string>(undefined);

  /**
   * Custom string used as the initial/undefined default option.
   */
  public readonly placeholder = input<string>(undefined);

  /**
   * Determines interactivity availability.
   *
   * Default to `false`;
   *
   * A model rather than an input: the forms API sets it.
   */
  public readonly disabled = model(false);

  /**
   * Event emitted when the value of the select input element is changed.
   */
  public readonly changed = output<T | string>();

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  private _onChange = (value: T | string) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  /**
   * Responsible for emitting the model changed event to the parent component.
   */
  public changeEvent() {
    this.changed.emit(this.value);
  }

  /**
   * Calls a utility function that evaluates the template against the iterated data item.
   *
   * If no value template is provided, return will be the object reference.
   */
  public getDataItemValue<U extends object>(iterated: U, template?: string): U | object {
    if (template !== undefined) {
      return getPropertyValue<U>(iterated, template);
    } else {
      return iterated;
    }
  }

  public writeValue(value: T | string) {
    this.value = value;
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }
}
