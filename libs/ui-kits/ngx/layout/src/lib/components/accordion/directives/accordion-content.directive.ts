import { Directive, HostBinding, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[giscAccordionContent]'
})
export class AccordionContentDirective {
  private _display = false;

  public get display(): boolean {
    return this.display;
  }

  public set display(v: boolean) {
    this._display = v;
  }

  @Input()
  public defaultDisplay: 'initial' | 'inherit' | 'block' | 'inline' | 'inline-block' = 'initial';

  constructor(private templateRef: TemplateRef<unknown>, private viewContainer: ViewContainerRef) {}

  @Input()
  public set giscAccordionContent(expanded: boolean) {
    if (expanded) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  @HostBinding('style.display')
  private get _contentExpanded() {
    return this._display ? this.defaultDisplay : 'none';
  }
}
