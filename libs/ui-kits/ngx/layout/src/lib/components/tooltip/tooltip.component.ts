import {
  Component,
  OnInit,
  Input,
  ElementRef,
  HostListener,
  ContentChild,
  AfterContentInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { TooltipTriggerComponent } from './components/tooltip-trigger/tooltip-trigger.component';
import { debounceTime, map, shareReplay, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit, OnDestroy, AfterContentInit {
  private _isVisible: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input()
  public width: number;

  @Input()
  public height: number;

  /**
   * The positioning of the tooltip content container.
   *
   * Defaults to 'absolute'. Is possible to overflow in undesired locations.
   *
   * 'fixed' strategy is experimental. Calculates the fixed positioning relative to the trigger.
   */
  @Input()
  public positioningStrategy: 'absolute' | 'fixed' = 'absolute';

  /**
   * The relative position of the trigger.
   */
  @Input()
  public position: 'left' | 'right' | 'bottom' | 'top';

  @Input()
  public set isVisible(value) {
    this._isVisible.next(value);
  }

  /**
   * The value passed in from the tooltip trigger to initiate the hiding/showing
   * of the tooltip content.
   */
  public get isVisible() {
    return this._isVisible.getValue();
  }

  @ContentChild(TooltipTriggerComponent, { static: true })
  public trigger: TooltipTriggerComponent;

  @ContentChild(TooltipTriggerComponent, { static: true, read: ElementRef })
  public triggerElem: ElementRef;

  @ViewChild('tooltipContainer') set content(c: ElementRef) {
    if (c) {
      // Container will be set when the *ngIf that determines its rendered state
      // is true
      this._container.next(c.nativeElement);
    }
  }

  /**
   * The container that wraps the projected tooltip content.
   */
  private _container: Subject<HTMLElement> = new Subject();

  /**
   * X (left) and Y (top) offsets relative to the trigger
   * calculated to position the tooltip content close to the trigger.
   *
   * Calculated when using the fixed positioning strategy
   */
  public containerPosition: Observable<IOffsetCoordinates>;

  /**
   * Controls when the tooltip content becomes visible. Is a delayed-emitting observable
   * on the `isVisible` member.
   *
   * This is done AFTER it has been added to the DOM and the position
   * offsets applied when using the fixed positioning strategy.
   */
  public tooltipContentVisible: Observable<boolean>;

  private _$destroy: Subject<boolean> = new Subject();

  /**
   * Detects if interaction clicks are within the component to reset the visibility
   */
  @HostListener('document:mousedown', ['$event'])
  public clickOutside(event) {
    if (this.isVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.isVisible = false;
    }
  }

  constructor(private elementRef: ElementRef) {}

  public ngOnInit() {
    // Set debounce time otherwise there will be two changes in the change detection cycle.
    this.containerPosition = combineLatest([this._container.pipe(debounceTime(0))]).pipe(
      map(([c]) => {
        const triggerRects: DOMRect = this.triggerElem.nativeElement.getBoundingClientRect();
        const containerRects: DOMRect = c.getBoundingClientRect();

        return [containerRects, triggerRects];
      }),
      map(([cr, tr]) => {
        return this.calculateOffset(tr, cr, { left: 0, top: 0, height: window.innerHeight, width: window.innerWidth }, 10);
      }),
      shareReplay()
    );

    // Because of the containerPosition debounce, the container will flash positions:
    // One when the element is first rendered in its initial location
    // And again when the offsets are applied.
    //
    // Tooltips are hidden by default and set to visible AFTER the offsets are applied to avoid
    // the position flashing.
    this.tooltipContentVisible = this._isVisible.pipe(debounceTime(1));
  }

  public ngAfterContentInit() {
    if (this.trigger) {
      this.trigger.triggerActivate.pipe(takeUntil(this._$destroy)).subscribe(() => {
        this.isVisible = !this.isVisible;
      });
    }
  }

  /**
   * Performs a search in a clockwise manner around a `reference` to place an `element` relative to it without
   * exceeding the `boundary`.
   *
   * When `referenceBuffer` is provided, the offset will consider a minimum distance from the `reference` block,
   * because the buffer itself might be just enough to push an offset past the containing boundary.
   */
  private calculateOffset(
    reference: PartialDomRect,
    element: PartialDomRect,
    boundary: PartialDomRect,
    referenceBuffer?: number
  ): IOffsetCoordinates {
    let x, y;

    // Dictionary of 4 locations, in a clockwise direction
    const possibleLocations: Array<[YPosition, XPosition]> = [
      ['top', 'center'],
      ['center', 'right'],
      ['bottom', 'center'],
      ['center', 'left']
    ];

    // pyl = possible y location
    // pxl = possible x location
    for (const [pyl, pxl] of possibleLocations) {
      y = this.calculateY(reference, element, pyl, 10);
      x = this.calculateX(reference, element, pxl, 10);

      // Check if determined coordinates within the boundary extent
      //
      // Check if initial offsets (top left of element) are inside the boundary.
      if (y > 0 && y < boundary.height && x > 0 && x < boundary.width) {
        // Check if the entire container at those offsets is within the boundary.
        if (y + element.height < boundary.height && x + element.width < boundary.width) {
          break;
        }
      }
    }

    return {
      x,
      y
    };
  }

  /**
   * Calculates the vertical offset for an `element` block relative to a `reference` block
   * that isn't outside a containing `boundary` block.
   */
  private calculateY(reference: PartialDomRect, element: PartialDomRect, pole: YPosition, buffer?: number) {
    let yInitial: number;
    let yOffset: number;
    let direction: 1 | -1 = 1;

    if (pole === 'top') {
      direction = -1;

      // If the element is going to be positioned above the reference box, then the yInitial
      // is the top edge of the reference box.
      yInitial = reference.top;
      yOffset = yInitial + direction * element.height;
    } else if (pole === 'bottom') {
      // If the element is going to be positioned below the reference, then then yInitial
      // is the bottom edge of the reference box.
      yInitial = reference.top + reference.height;
      yOffset = yInitial;
    } else if (pole === 'center') {
      direction = -1;
      yInitial = reference.top - reference.height / 2;
      yOffset = yInitial + (direction * element.height) / 2;
    }

    if (buffer !== undefined) {
      yOffset += direction * buffer;
    }

    return yOffset;
  }

  private calculateX(reference: PartialDomRect, element: PartialDomRect, hemisphere: XPosition, buffer?: number) {
    let xInitial: number;
    let xOffset: number;
    let direction: 1 | -1 = 1;

    if (hemisphere === 'left') {
      direction = -1;

      // If the element is going to be positioned above the reference box, then the yInitial
      // is the top edge of the reference box.
      xInitial = reference.left;
    } else if (hemisphere === 'right') {
      // If the element is going to be positioned below the reference, then then yInitial
      // is the bottom edge of the reference box.
      xInitial = reference.left + reference.width;
    } else if (hemisphere === 'center') {
      direction = -1;
      xInitial = reference.left + reference.width / 2;
    }

    if (buffer !== undefined) {
      xOffset += direction * buffer;
    }

    if (hemisphere === 'center') {
      xOffset = xInitial + direction * (element.width / 2);
    } else {
      xOffset = xInitial + direction * element.width;
    }

    return xOffset;
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}

type PartialDomRect = Partial<DOMRect>;
type YPosition = 'top' | 'bottom' | 'center';
type XPosition = 'left' | 'right' | 'center';
interface IOffsetCoordinates {
  x: number;
  y: number;
}
