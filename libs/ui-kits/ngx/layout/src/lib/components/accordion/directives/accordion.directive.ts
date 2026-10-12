import { Directive, Input, HostBinding, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscAccordion]'
})
export class AccordionDirective implements OnInit {
  private templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  @Input()
  public expanded = false;

  @HostBinding('class.accordion-expanded')
  private get _expanded() {
    return this.expanded;
  }

  private _$destroy: Subject<boolean> = new Subject();

  public ngOnInit(): void {
    this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this
    });
  }
}
