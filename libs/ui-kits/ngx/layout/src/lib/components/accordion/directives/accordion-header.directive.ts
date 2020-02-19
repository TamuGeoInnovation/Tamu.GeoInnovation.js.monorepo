import { Directive, HostListener, Output, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AccordionDirective } from './accordion.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[giscAccordionHeader]'
})
export class AccordionHeaderDirective {
  public parent: AccordionDirective;

  @HostListener('click', ['$event'])
  private _toggle(e: MouseEvent) {
    this.parent.expanded = !this.parent.expanded;
  }

  @Input()
  public set giscAccordionHeader(controller){
    this.parent = controller;
  }

  constructor() {}
}
