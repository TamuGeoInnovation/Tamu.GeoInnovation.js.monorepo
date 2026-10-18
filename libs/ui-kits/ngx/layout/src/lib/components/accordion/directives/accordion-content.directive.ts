import { Directive, HostBinding, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

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

  public readonly defaultDisplay = input<'initial' | 'inherit' | 'block' | 'inline' | 'inline-block'>('initial');

  public readonly giscAccordionContent = input<boolean>(undefined);

  constructor() {
    // Renders the content while expanded, and removes it when collapsed.
    effect(() => {
      if (this.giscAccordionContent()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  @HostBinding('style.display')
  private get _contentExpanded() {
    return this._display ? this.defaultDisplay() : 'none';
  }
}
