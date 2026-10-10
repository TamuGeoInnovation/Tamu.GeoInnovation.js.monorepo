import { AfterContentInit, Directive, ElementRef, Input, Renderer2, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[elementInsert]'
})
export class ElementInsertDirective implements AfterContentInit {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  @Input()
  public elementInsert: Element;

  public ngAfterContentInit() {
    this.renderer.appendChild(this.elementRef.nativeElement, this.elementInsert);
  }
}
