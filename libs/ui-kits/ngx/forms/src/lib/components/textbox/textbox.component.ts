import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { AbstractValueAccessorFormComponent } from '../../models/abstract-value-accessor-form/abstract-value-accessor-form.component';

@Component({
  selector: 'tamu-gisc-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextboxComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextboxComponent extends AbstractValueAccessorFormComponent<string> {
  /**
   * Use the host `formControlName` directive as the input form name used to identify input fields and label ownership.
   *
   * Defaults to `default`
   */
  @Input()
  public formControlName = 'default';

  /**
   * Responsible for rendering the correct input element (input vs textarea), and setting its associated type attribute.
   */
  @Input()
  public type: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url' | 'textarea';

  /**
   * Used for `textarea` type, binding to its rows attribute.
   *
   * Defaults to `4`
   */
  @Input()
  public rows = 4;

  /**
   * Text used in the accompanying label.
   */
  @Input()
  public placeholder: string;

  /**
   * Describes the behavior of the accompanying label.
   *
   * A value of `true` will animate the label above the input on value length > 0.
   *
   * A value of `false` will de-render the label on input value length > 0.
   *
   * Defaults to `false`
   */
  @Input()
  public floatLabel = false;
}

