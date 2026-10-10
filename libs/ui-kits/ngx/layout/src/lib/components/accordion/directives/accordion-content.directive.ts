import { Directive, HostBinding, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscAccordionContent]'
})
export class AccordionContentDirective {
  private templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  private _display = false;

  public get display(): boolean {
    return this.display;
  }

  public set display(v: boolean) {
    this._display = v;
  }

  @Input()
  public defaultDisplay: 'initial' | 'inherit' | 'block' | 'inline' | 'inline-block' = 'initial';

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
