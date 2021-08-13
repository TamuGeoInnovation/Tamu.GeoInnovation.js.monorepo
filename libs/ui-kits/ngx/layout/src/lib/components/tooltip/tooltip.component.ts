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
  public containerPosition: Observable<{ x: string; y: string }>;

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
        const padding = 10;
        const leftOffset = tr.left - cr.width / 2;
        const topOffset = tr.top - cr.height - padding;
        return { x: `${leftOffset}px`, y: `${topOffset}px` };
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

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}
