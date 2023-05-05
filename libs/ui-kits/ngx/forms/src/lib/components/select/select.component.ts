import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<T extends object> implements ControlValueAccessor {
  /**
   * Functions as the initial/default or state value of the select element.
   *
   * If no `model` is provided from the parent, the placeholder is automatically selected.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value')
  private _value: T = undefined;

  public get value() {
    return this._value;
  }

  public set value(value: T) {
    this._value = value === null || value === undefined || value === ('undefined' as unknown) ? undefined : value;
    this._onChange(value === null || value === undefined || value === ('undefined' as unknown) ? undefined : value);
    this._onTouched();
    this.cd.markForCheck();
  }

  /**
   * Iterable data collection that will be used to generate the drop-down options.
   */
  @Input()
  public data: T[];

  /**
   * Dot-notation string representing the evaluated property used in the display of the option element.
   */
  @Input()
  public displayTemplate: string;

  /**
   * Dot-notation string representing the evaluated property used in the option data model.
   */
  @Input()
  public valueTemplate: string;

  /**
   * Custom string used as the initial/undefined default option.
   */
  @Input()
  public placeholder?: string;

  /**
   * Determines interactivity availability.
   *
   * Default to `false`;
   */
  @Input()
  public disabled = false;

  /**
   * Event emitted when the value of the select input element is changed.
   */
  @Output()
  public changed: EventEmitter<T> = new EventEmitter();

  constructor(private cd: ChangeDetectorRef) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange = (value: T) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  /**
   * Responsible for emitting the model changed event to the parent component.
   */
  public changeEvent() {
    this.changed.next(this.value);
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

  public writeValue(value: T) {
    this.value = value;
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
}
