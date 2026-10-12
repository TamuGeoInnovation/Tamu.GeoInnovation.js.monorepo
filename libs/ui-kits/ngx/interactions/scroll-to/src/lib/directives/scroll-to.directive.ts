import { Directive, HostListener, HostBinding, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[scrollTo]'
})
export class ScrollToDirective {
  public readonly scrollTo = input<string | HTMLElement>(undefined);

  @HostBinding('tabindex')
  private tabIndex() {
    return 0;
  }

  @HostListener('click')
  protected onClick() {
    this.scroll();
  }

  @HostListener('keydown.space', ['$event'])
  protected onKeydown(e: KeyboardEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  @HostListener('keyup.enter')
  @HostListener('keyup.space')
  protected onKeyup() {
    this.scroll();
  }

  private scroll() {
    const scrollTo = this.scrollTo();
    if (scrollTo !== undefined) {
      // Handle references by class, id, or tag
      if (typeof scrollTo === 'string') {
        const elem = document.querySelector(scrollTo);

        elem.scrollIntoView({ behavior: 'smooth' });
      } else if (scrollTo instanceof HTMLElement) {
        // Handle references by provided HTMLElement
        scrollTo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
