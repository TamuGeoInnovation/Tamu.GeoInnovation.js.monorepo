import { AfterContentInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[elementInsert]'
})
export class ElementInsertDirective implements AfterContentInit {
  @Input()
  public elementInsert: Element;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  public ngAfterContentInit() {
    this.renderer.appendChild(this.elementRef.nativeElement, this.elementInsert);
  }
}
