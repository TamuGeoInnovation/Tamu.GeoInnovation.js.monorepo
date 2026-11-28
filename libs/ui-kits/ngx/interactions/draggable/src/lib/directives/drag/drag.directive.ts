import { Directive, AfterViewInit, ElementRef, AfterViewChecked, OnDestroy, inject, input, output } from '@angular/core';

import { DragService, UIDragState } from '../../services/drag/drag.service';

import interact from 'interactjs';

/**
 * How far below its resting place a sheet is dragged before letting go closes it, in pixels (#1439): far enough that a
 * tap or a small slip of the finger leaves it open, near enough to be one short pull.
 */
export const DISMISS_PULL = 64;

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[draggable]'
})
export class DragDirective implements AfterViewInit, AfterViewChecked, OnDestroy {
  private el = inject(ElementRef);
  private dragService = inject(DragService);

  /**
   * Unique component identifier generated when the component register with the UI drag service.
   */
  public readonly identifier = input<string>(undefined, { alias: 'draggableIdentifier' });

  /**
   * Emits when the sheet is dragged down past where it rests, by at least `DISMISS_PULL` pixels, and let go (#1439). A
   * sheet that can be closed closes on it; one that cannot, such as the bus lists, ignores it and springs back.
   */
  public readonly dismissed = output<void>();

  /** How far below its resting place the sheet has been pulled in this drag, in pixels. */
  private pull = 0;

  /**
   * Represents y-offset that is initially present when the element is rendered.
   */
  public initialOffset: number;

  /**
   * Calculated inner or outer screen height for both Android and iOS devices.
   */
  public deviceHeight: number;

  /**
   * Draggable event reference. Needs to be stored in variable in order to destroy event handlers on component destroy.
   */
  private draggable: Interact.Interactable;

  private lastContentHeight: number;

  public ngAfterViewInit() {
    if (!this.identifier()) {
      console.warn(
        'Draggable directive was not provided a component identifier. Provide an identifier with the [draggableIdentifier] property.'
      );
    }

    this.draggable = interact('.draggable').draggable({
      inertia: true
      // restrict: {
      //   restriction: 'self'
      // }
    });

    // `interact('.draggable')` is one object shared by every sheet on the page, so every directive hears every sheet's
    // drag. Each acts only on its own: with two sheets, both moved the one dragged, and a pull on the bus list would have
    // closed a building's sheet (#1439).
    const own = (event: { target: EventTarget }) => event.target === this.el.nativeElement;

    this.draggable.on('dragmove', (event) => own(event) && this._dragMoveListener(event));

    this.draggable.on('dragstart', (event) => own(event) && this._dragStartListener());

    this.draggable.on('dragend', (event) => own(event) && this._dragEndListener());

    this.draggable.on('tap', (event) => {
      event.interaction.stop();
    });
  }

  public ngAfterViewChecked() {
    // Store the initial offset which will be used to set the base snap point.
    if (this.el.nativeElement.innerText.trim() !== '' && this.initialOffset === undefined) {
      this.deviceHeight = window.innerHeight > 0 ? window.innerHeight : window.outerHeight;
      this.initialOffset = this.deviceHeight - this.draggable.getRect(this.el.nativeElement).top;
    }

    // Handle inner content changes that would cause a dragged element to float if the new height is less than the last
    if (this.el.nativeElement.innerText.trim() !== '') {
      const rect = this.draggable.getRect(this.el.nativeElement);

      if (rect) {
        if (this.lastContentHeight && this.lastContentHeight !== Math.floor(rect.height)) {
          if (this.draggable.getRect(this.el.nativeElement).bottom < window.innerHeight) {
            const anchor = this.initialOffset - this.draggable.getRect(this.el.nativeElement).height;

            (<HTMLElement>this.el.nativeElement).setAttribute('data-y', anchor.toString());
            (<HTMLElement>this.el.nativeElement).style.transform = 'translate(0px, ' + anchor + 'px)';
          }
        }

        this.lastContentHeight = Math.floor(this.draggable.getRect(this.el.nativeElement).height);
      }
    }
  }

  public ngOnDestroy() {
    this.draggable.unset();
  }

  /**
   * Handles element repositioning on element swipe to drag.
   */
  private _dragMoveListener(event) {
    // Dispatch acton based on action direction
    this.dragService.state = new UIDragState({
      guid: this.identifier(),
      dragState: 'drag-move',
      dragPercentage: this.getDragPercentage()
    });

    if (event.dy > 0) {
      // Swipe down

      // Get dragged values from attributes
      const target = event.target,
        // x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      const position = this.draggable.getRect(this.el.nativeElement);

      const limitReached = this.deviceHeight - Math.floor(position.top) <= this.initialOffset;

      if (!limitReached) {
        // Set transition
        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + y + 'px)';

        // Set persistent values
        target.setAttribute('data-y', y);
      } else {
        // At its resting place: the sheet follows the finger down, so letting go there can close it (#1439). It was
        // held in place and the drag stopped, so the handle invited a gesture that did nothing.
        this.pull += event.dy;

        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + this.pull + 'px)';

        target.setAttribute('data-y', 0);
      }
    } else if (event.dy < 0 && this.pull > 0) {
      // Back up while pulled below the resting place: the sheet follows, and stops where it rests.
      this.pull = Math.max(0, this.pull + event.dy);

      event.target.style.webkitTransform = event.target.style.transform = 'translate(0px, ' + this.pull + 'px)';
    } else if (event.dy < 0) {
      // Swipe up
      const isMax = Math.floor(this.draggable.getRect(this.el.nativeElement).bottom - 2) <= this.deviceHeight;

      // If the limit has been reached, and the action is an upward movement
      // Do not attempt to reposition the element as it has nowhere to go
      if (!isMax) {
        // Limit has not been reached, continue to scroll until the limit is reached
        const target = event.target,
          // Get dragged values from attributes
          // x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y =
            (parseFloat(target.getAttribute('data-y')) || 0) + event.dy <=
            -(this.draggable.getRect(this.el.nativeElement).height - this.initialOffset)
              ? -(this.draggable.getRect(this.el.nativeElement).height - this.initialOffset)
              : (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + y + 'px)';

        target.setAttribute('data-y', y);
      }
    }
  }

  private _dragStartListener() {
    this.pull = 0;

    this.dragService.state = new UIDragState({
      guid: this.identifier(),
      dragState: 'drag-start',
      dragPercentage: this.getDragPercentage()
    });
  }

  private _dragEndListener() {
    this.dragService.state = new UIDragState({
      guid: this.identifier(),
      dragState: 'drag-end',
      dragPercentage: this.getDragPercentage()
    });

    if (this.pull > 0) {
      const dismiss = this.pull >= DISMISS_PULL;

      // Back to where it rests either way: a dismissed sheet is hidden by its owner, and opens there next time.
      this.pull = 0;

      const element = this.el.nativeElement as HTMLElement;

      element.style.webkitTransform = element.style.transform = 'translate(0px, 0px)';
      element.setAttribute('data-y', '0');

      if (dismiss) {
        this.dismissed.emit();
      }
    }
  }

  public getDragPercentage(): number {
    return 100 - (this.draggable.getRect(this.el.nativeElement).top / (this.deviceHeight - this.initialOffset)) * 100;
  }
}
