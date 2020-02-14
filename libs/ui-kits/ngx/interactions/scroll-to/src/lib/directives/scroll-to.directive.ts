import { Directive, HostListener, Input, HostBinding, Host } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[scrollTo]'
})
export class ScrollToDirective {
  @Input()
  public scrollTo: string | HTMLElement;

  @HostBinding('tabindex')
  private tabIndex() {
    return 0;
  }

  @HostListener('click')
  private onClick(e: MouseEvent) {
    this.scroll();
  }

  @HostListener('keydown.space', ['$event'])
  private onKeydown(e: KeyboardEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  @HostListener('keyup.enter')
  @HostListener('keyup.space')
  private onKeyup(e: KeyboardEvent) {
    this.scroll();
  }

  constructor() {}

  private scroll() {
    if (this.scrollTo !== undefined) {
      // Handle references by class, id, or tag
      if (typeof this.scrollTo === 'string') {
        const elem = document.querySelector(this.scrollTo);

        elem.scrollIntoView({ behavior: 'smooth' });
      } else if (this.scrollTo instanceof HTMLElement) {
        // Handle references by provided HTMLElement
        this.scrollTo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
