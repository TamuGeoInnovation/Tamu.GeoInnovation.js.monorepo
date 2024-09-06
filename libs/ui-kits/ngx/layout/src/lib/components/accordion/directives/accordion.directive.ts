import { Directive, Input, HostBinding, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscAccordion]'
})
export class AccordionDirective implements OnInit {
  @Input()
  public expanded = false;

  @HostBinding('class.accordion-expanded')
  private get _expanded() {
    return this.expanded;
  }

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private templateRef: TemplateRef<unknown>, private viewContainer: ViewContainerRef) {}

  public ngOnInit(): void {
    this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this
    });
  }
}
