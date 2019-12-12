import { Directive, ElementRef, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[accordion]'
})
export class AccordionDirective implements OnChanges, OnInit, OnDestroy {
  /**
   * Input boolean from the parent component that serves as a collapse/expand toggle
   * for the accordion.
   *
   * @type {boolean}
   * @memberof AccordionDirective
   */
  @Input()
  public accordionExpanded: boolean;

  /**
   * Determines if the accordion animate when expanding or collapsing.
   *
   * Animation is not always ideal, especially when components are re-rendered on change
   * detection cyles which would cause the accordion to flash open or closed abruptly.
   *
   * @type {boolean}
   * @memberof AccordionDirective
   */
  @Input()
  public animate: boolean;

  /**
   * If `true`, detects accordion children content changes and fires off an accordion resize.
   *
   * Defaults to `false`.
   *
   * @type {boolean}
   * @memberof AccordionDirective
   */
  @Input()
  public resize: boolean;

  /**
   * If `resize` is set to `true`, this will be set to the mutation observer so that the directive
   * can dispose of the observer on component destroy.
   *
   * @private
   * @type {*}
   * @memberof AccordionDirective
   */
  private mutationObserver: MutationObserver;

  constructor(private el: ElementRef) {}

  public ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to
    // ngOnChanges. Add 'implements OnInit' to the class.
    //
    (<HTMLElement>this.el.nativeElement).style.overflow = 'hidden';

    // If accordion animation is true, set the transition properties responsible for animating the max-height property.
    if (this.animate) {
      (<HTMLElement>this.el.nativeElement).style.transition = 'max-height .20s';
      // tslint:disable-next-line
      (<HTMLElement>this.el.nativeElement).style.webkitTransition = 'max-height .20s';
    }

    // If resize is set to `true`, initialize a mutation observer on the host element. The callback will trigger an
    // accordion height set.
    if (this.resize) {
      this.mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
        this.setAccordionHeight();
      });
      this.mutationObserver.observe(this.el.nativeElement, {
        childList: true,
        attributes: false,
        subtree: true
      });
    }
  }

  // On Input model value changes, re-calculate the target accordion class activated state
  public ngOnChanges(changes: SimpleChanges): void {
    this.setAccordionHeight();
  }

  public ngOnDestroy(): void {
    // Dispose of any mutation observers on component destroy.
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  public setAccordionHeight() {
    if (this.accordionExpanded) {
      (<HTMLElement>this.el.nativeElement).classList.add('accordion-expanded');

      // If animatable property is true, we want to determine the inner height of the accordion and set it to be the accordion
      // container height. This will allow smoothing the accordion from 0px to Xpx.
      if (this.animate) {
        (<HTMLElement>this.el.nativeElement).style.maxHeight = `${(<HTMLElement>this.el.nativeElement).scrollHeight}px`;
      } else {
        (<HTMLElement>this.el.nativeElement).style.maxHeight = `none`;
      }
    } else {
      (<HTMLElement>this.el.nativeElement).classList.remove('accordion-expanded');
      (<HTMLElement>this.el.nativeElement).style.maxHeight = '0px';
    }
  }
}
