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
  public readonly giscAccordionHeader = input<AccordionDirective>(undefined);

  @HostListener('click')
  protected _toggle() {
    const parent = this.giscAccordionHeader();

    parent.expanded.set(!parent.expanded());
  }
}
