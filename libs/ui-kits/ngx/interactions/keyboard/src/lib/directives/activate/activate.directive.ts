import { Directive, output } from '@angular/core';

/**
 * Makes a non-button element (typically a styled `div.button`) behave as a button for the keyboard and
 * assistive technology: focusable, announced as a button, and activated by click, Enter or Space.
 *
 * Space is prevented from scrolling the page. Bind to it as `(tamuGiscActivate)="..."`.
 */
@Directive({
  selector: '[tamuGiscActivate]',
  host: {
    role: 'button',
    tabindex: '0',
    '(click)': 'activate()',
    '(keydown.enter)': 'activate()',
    '(keydown.space)': 'onSpace($event)'
  }
})
export class ActivateDirective {
  public readonly tamuGiscActivate = output<void>();

  public activate(): void {
    this.tamuGiscActivate.emit();
  }

  public onSpace(event: Event): void {
    event.preventDefault();
    this.activate();
  }
}
