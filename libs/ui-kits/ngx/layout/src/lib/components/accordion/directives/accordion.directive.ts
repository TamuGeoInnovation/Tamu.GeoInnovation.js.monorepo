import { Directive, Input, HostBinding, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscAccordion]'
})
export class AccordionDirective {
  @Input()
  public expanded = false;

  @HostBinding('class.accordion-expanded')
  private get _expanded() {
    return this.expanded;
  }

  @Input()
  public set giscAccordion(v) {
    this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this
    });
  }

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private templateRef: TemplateRef<unknown>, private viewContainer: ViewContainerRef) {}
}
