import {
  Component,
  OnInit,
  ElementRef,
  Input,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { IAccordionModel } from '../accordion.component';

@Component({
  selector: 'tamu-gisc-accordion-content',
  templateUrl: './accordion-content.component.html',
  styleUrls: ['./accordion-content.component.scss']
})
export class AccordionContentComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input()
  public model: IAccordionModel = {
    animate: false,
    expanded: false,
    resize: false
  };

  /**
   * If `resize` is set to `true`, this will be set to the mutation observer so that the directive
   * can dispose of the observer on component destroy.
   *
   * @private
   * @type {*}
   * @memberof AccordionDirective
   */
  private mutationObserver: MutationObserver;

  @ViewChild('content', { static: true })
  public _container: ElementRef;

  constructor() {}

  public ngOnInit() {}

  public ngAfterViewInit(): void {
    // If resize is set to `true`, initialize a mutation observer on the host element. The callback will trigger an
    // accordion height set.
    if (this.model.resize) {
      this.mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
        this.setAccordionHeight();
      });

      this.mutationObserver.observe(this._container.nativeElement, {
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
    if (this.model.expanded) {
      // If animate property is true, we want to determine the inner height of the accordion and set it to be the accordion
      // container height. This will allow smoothing the accordion from 0px to Xpx.
      if (this.model.animate) {
        (<HTMLElement>this._container.nativeElement).style.maxHeight = `${
          (<HTMLElement>this._container.nativeElement).scrollHeight
        }px`;
      }
    }
  }
}
