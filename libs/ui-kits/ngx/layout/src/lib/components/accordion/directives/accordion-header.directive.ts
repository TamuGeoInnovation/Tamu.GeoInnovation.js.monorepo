import { Directive, HostListener, Output, HostBinding, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AccordionService } from '../services/accordion.service';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[giscAccordionHeader]'
})
export class AccordionHeaderDirective {
  @Output()
  public toggle: Subject<boolean> = new Subject();

  public expanded: boolean;

  @HostListener('click', ['$event'])
  private _toggle(e: MouseEvent) {
    this.toggle.next();
  }

  @Input()
  public set giscAccordionHeader(controller){
    debugger
  }

  constructor() {}
}
