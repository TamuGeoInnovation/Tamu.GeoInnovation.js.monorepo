import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';

import { AbstractValueAccessorFormComponent } from '../../models/abstract-value-accessor-form/abstract-value-accessor-form.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeComponent extends AbstractValueAccessorFormComponent<number> {
  /**
   * Use the host `formControlName` directive as the input form name used to identify input fields and label ownership.
   *
   * Defaults to `default`
   */
  @Input()
  public formControlName: 'default';

  @Input()
  public max = 100;

  @Input()
  public min = 0;

  @Input()
  public step = 1;

  @Input()
  public label: string;

  @Input()
  public limitFormat: 'currency' | 'number' | 'none' = 'number';
}
