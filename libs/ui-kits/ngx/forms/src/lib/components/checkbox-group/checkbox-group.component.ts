import {
  Component,
  OnInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Input,
  OnDestroy,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { from, of, Subject, merge } from 'rxjs';
import { switchMap, mergeMap, takeUntil } from 'rxjs/operators';

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
export class CheckboxGroupComponent implements OnInit, OnDestroy, AfterContentInit, ControlValueAccessor {
  @ContentChildren(CheckboxComponent)
  public checkboxes: QueryList<CheckboxComponent>;

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
  @Input()
  public referenceId: string;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value')
  private _value: Array<string | number> = [];

  public get value() {
    return [...this._value];
  }

  public set value(values) {
    this._value = [...values];
    this._onChange([...values]);
    this._onTouched();
  }

  private _$destroy: Subject<boolean> = new Subject();

  private _onChange = (values: Array<string | number>) => {
    return values;
  };

  private _onTouched = () => {
    return;
  };

  public ngOnInit() {
    if (this.referenceId === undefined) {
      throw new Error('No reference ID provided.');
    }
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public ngAfterContentInit() {
    this.setChildrenValue();

    this.checkboxes.changes.subscribe(() => {
      this.setChildrenValue();
    });

    // Subscribe to the immediate QueryList which will capture
    // resolved checkbox components and also subscribe to the QueryList changes stream.
    //
    // This will ensure that this component is able to handle both immediately-available
    // checkbox components, as well as those generated with the *ngFor directive.
    merge(of(this.checkboxes), this.checkboxes.changes)
      .pipe(
        switchMap((checkboxes: QueryList<CheckboxComponent>) => {
          return from(checkboxes.toArray()).pipe(
            mergeMap((checkbox) => {
              return checkbox.changed.pipe(
                switchMap(() => {
                  return of(getPropertyValue<string>(checkbox.data, this.referenceId));
                })
              );
            })
          );
        }),
        takeUntil(this._$destroy)
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
   * Set the checked state of children checkbox components to reflect the group value.
   */
  private setChildrenValue() {
    if (this.checkboxes && this.checkboxes.length > 0) {
      this.checkboxes.forEach((checkbox) => {
        const propValue = getPropertyValue<string>(checkbox.data, this.referenceId);

        // Use == to handle cases where the value is a coerced string or number
        // 3 == '3' -> true
        const isIncluded = this.value.some((v) => v == propValue);

        if (isIncluded) {
          setTimeout(() => {
            // Update child checked status, bypassing forms api and self event emission because
            // to prevent a subsequent self-value change which would loop back to the checkbox
            // value change and set to the inverse.
            checkbox._setValueNoEmit(true);
          }, 0);
        }
      });
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

    this.setChildrenValue();
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }
}
