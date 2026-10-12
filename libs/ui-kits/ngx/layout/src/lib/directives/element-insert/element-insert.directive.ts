import { AfterContentInit, Directive, ElementRef, Renderer2, inject, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[elementInsert]'
})
export class ElementInsertDirective implements AfterContentInit {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  public readonly elementInsert = input<Element>(undefined);

  public ngAfterContentInit() {
    this.renderer.appendChild(this.elementRef.nativeElement, this.elementInsert());
  }
}
