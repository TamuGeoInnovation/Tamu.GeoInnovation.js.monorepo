import {
  Component,
  forwardRef,
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit,
  input,
  viewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

import { AbstractValueAccessorFormComponent } from '../../models/abstract-value-accessor-form/abstract-value-accessor-form.component';
import { NgClass } from '@angular/common';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgClass]
})
export class TextboxComponent extends AbstractValueAccessorFormComponent<string> implements AfterViewInit {
  readonly inputElement = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('inputElement');

  /**
   * Use the host `formControlName` directive as the input form name used to identify input fields and label ownership.
   *
   * Defaults to `default`
   */
  public readonly formControlName = input('default');

  /**
   * Responsible for rendering the correct input element (input vs textarea), and setting its associated type attribute.
   */
  public readonly type = input<'email' | 'number' | 'password' | 'tel' | 'text' | 'url' | 'textarea'>(undefined);

  /**
   * Used for `textarea` type, binding to its rows attribute.
   *
   * Defaults to `4`
   */
  public readonly rows = input(4);

  /**
   * Text used in the accompanying label.
   */
  public readonly placeholder = input<string>(undefined);

  /**
   * Describes the behavior of the accompanying label.
   *
   * A value of `true` will animate the label above the input on value length > 0.
   *
   * A value of `false` will de-render the label on input value length > 0.
   *
   * Defaults to `false`
   */
  public readonly floatLabel = input(false);

  public readonly autofocus = input(false);

  ngAfterViewInit(): void {
    if (this.autofocus() && this.inputElement()) {
      setTimeout(() => {
        this.inputElement().nativeElement.focus();
      }, 0);
    }
  }
}
