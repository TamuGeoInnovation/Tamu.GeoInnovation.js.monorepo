import { Component, OnInit, forwardRef, input, model, contentChildren, effect, untracked } from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { merge } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CheckboxComponent } from '../checkbox/checkbox.component';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';

@Component({
  selector: 'tamu-gisc-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxGroupComponent),
      multi: true
    }
  ]
})
export class CheckboxGroupComponent implements OnInit, ControlValueAccessor {
  public readonly checkboxes = contentChildren(CheckboxComponent);

  /**
   * A property in a checkbox model that is evaluated and used to generate a list of
   * of unique selected/checked checkboxes.
   *
   * For example given the following checkbox model:
   *
   * ```js
   * {
   *  name: 'bob'
   * }
   * ```
   *
   * Providing `name` as the referenceId,
   *
   * Given the default state of the checkbox group is `[]`, for no selected checkboxes.
   *
   * When the 'bob' checkbox is checked, the checkbox group state will update to `['bob']`
   * to represent that in the checkbox group, 'bob' is active.
   */
  public readonly referenceId = input<string>(undefined);

  // A model rather than an input: the component sets it itself, from its checkboxes and the forms API.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  protected readonly _value = model<Array<string | number>>([], { alias: 'value' });

  public get value() {
    return [...this._value()];
  }

  public set value(values) {
    this._value.set([...values]);
    this._onChange([...values]);
    this._onTouched();
  }

  private _onChange = (values: Array<string | number>) => {
    return values;
  };

  private _onTouched = () => {
    return;
  };

  public ngOnInit() {
    if (this.referenceId() === undefined) {
      throw new Error('No reference ID provided.');
    }
  }

  constructor() {
    // Tick each checkbox whose reference value is in the group value, and untick the rest, whenever the
    // value, the set of checkboxes or any checkbox's `data` changes. Reading `data()` here is the point:
    // the content query lists checkboxes made by a loop before their `[data]` is bound, so ticking them
    // once, then, ticked nothing, and an event opened in the admin showed its saved tags unticked (#2887).
    effect(() => {
      const value = this._value();

      this.checkboxes().forEach((checkbox) => {
        const propValue = getPropertyValue<string>(checkbox.data(), this.referenceId());

        // Use == to handle cases where the value is a coerced string or number
        // 3 == '3' -> true
        const isIncluded = propValue !== undefined && value.some((v) => v == propValue);

        // Bypasses the forms API and the checkbox's own `changed` event, which would toggle the group
        // value straight back.
        untracked(() => checkbox._setValueNoEmit(isIncluded));
      });
    });

    // Each time the projected checkboxes change, including the first time they resolve, listen for
    // changes on the new set.
    toObservable(this.checkboxes)
      .pipe(
        switchMap((checkboxes) => {
          return merge(
            ...checkboxes.map((checkbox) => {
              return outputToObservable(checkbox.changed).pipe(
                map(() => getPropertyValue<string>(checkbox.data(), this.referenceId()))
              );
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        this.toggle(res);
      });
  }

  /**
   * Check to see if provided value exists. If it exists in the group value,
   * remove it, else add it.
   */
  private toggle(valueToToggle) {
    if (!valueToToggle) {
      return;
    }

    const val = this.value;
    const indexOfExisting = val.indexOf(valueToToggle);

    if (indexOfExisting > -1) {
      val.splice(indexOfExisting, 1);
      this.value = val;
    } else {
      val.push(valueToToggle);
      this.value = val;
    }
  }

  /**
   * Values will always be a singular string or number or an array of strings or numbers.
   *
   * When a singular value is provided, it will be converted to an array of one.
   *
   * When a string is provided, it will be split by comma and converted to an array.
   *
   * Number inputs as strings will be problematic because the value will be coerced to a string and
   * equality checks will fail.
   */
  public writeValue(value) {
    if (value === null) return;

    // Handle string inputs
    if (typeof value === 'string') {
      const split = value.split(',');

      this.value = split;
    } else if (typeof value === 'number') {
      this.value = [value];
    } else {
      this.value = [...value];
    }
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }
}
