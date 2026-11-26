import { Directive, HostListener, input } from '@angular/core';
import { AccordionDirective } from './accordion.directive';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscAccordionHeader]'
})
export class AccordionHeaderDirective {
  /**
   * The accordion this header toggles.
   */
  // Required: every header names its accordion, `[giscAccordionHeader]="parent"` (#3601).
  public readonly giscAccordionHeader = input.required<AccordionDirective>();

  @HostListener('click')
  protected _toggle() {
    const parent = this.giscAccordionHeader();

    parent.expanded.set(!parent.expanded());
  }
}
