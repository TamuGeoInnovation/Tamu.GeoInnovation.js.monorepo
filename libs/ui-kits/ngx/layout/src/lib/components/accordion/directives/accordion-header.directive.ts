import { Directive, HostListener, Input } from '@angular/core';
import { AccordionDirective } from './accordion.directive';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscAccordionHeader]'
})
export class AccordionHeaderDirective {
  public parent: AccordionDirective;

  @HostListener('click', ['$event'])
  private _toggle() {
    this.parent.expanded = !this.parent.expanded;
  }

  @Input()
  public set giscAccordionHeader(controller) {
    this.parent = controller;
  }
}
