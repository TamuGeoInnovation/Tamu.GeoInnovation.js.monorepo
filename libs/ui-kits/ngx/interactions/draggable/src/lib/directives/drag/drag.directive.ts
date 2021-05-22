import { Directive, AfterViewInit, ElementRef, AfterViewChecked, OnDestroy, Input } from '@angular/core';

import { DragService, UIDragState } from '../../services/drag/drag.service';

import interact from 'interactjs';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[draggable]'
})
export class DragDirective implements AfterViewInit, AfterViewChecked, OnDestroy {
  /**
   * Unique component identifier generated when the component register with the UI drag service.
   */
  @Input('draggableIdentifier') public identifier: string;

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

  constructor(private el: ElementRef, private dragService: DragService) {}

  public ngAfterViewInit() {
    if (!this.identifier) {
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

    this.draggable.on('dragmove', (event) => this._dragMoveListener(event));

    this.draggable.on('dragstart', (event) => this._dragStartListener(event));

    this.draggable.on('dragend', (event) => this._dragEndListener(event));

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
      guid: this.identifier,
      dragState: 'drag-move',
      dragPercentage: this.getDragPercentage()
    });

    if (event.dy > 0) {
      // Swipe down

      // Get dragged values from attributes
      const target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      const position = this.draggable.getRect(this.el.nativeElement);

      const limitReached = this.deviceHeight - Math.floor(position.top) <= this.initialOffset;

      if (!limitReached) {
        // Set transition
        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + y + 'px)';

        // Set persistent values
        target.setAttribute('data-y', y);
      } else {
        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + '0px)';

        target.setAttribute('data-y', 0);

        if (event && event.interaction && event.interaction.stop) {
          event.interaction.stop();
        }
      }
    } else if (event.dy < 0) {
      // Swipe up
      const isMax = Math.floor(this.draggable.getRect(this.el.nativeElement).bottom - 2) <= this.deviceHeight;

      // If the limit has been reached, and the action is an upward movement
      // Do not attempt to reposition the element as it has nowhere to go
      if (!isMax) {
        // Limit has not been reached, continue to scroll until the limit is reached
        const target = event.target,
          // Get dragged values from attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
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

  private _dragStartListener(event) {
    this.dragService.state = new UIDragState({
      guid: this.identifier,
      dragState: 'drag-start',
      dragPercentage: this.getDragPercentage()
    });
  }

  private _dragEndListener(event) {
    this.dragService.state = new UIDragState({
      guid: this.identifier,
      dragState: 'drag-end',
      dragPercentage: this.getDragPercentage()
    });
  }

  public getDragPercentage(): number {
    return 100 - (this.draggable.getRect(this.el.nativeElement).top / (this.deviceHeight - this.initialOffset)) * 100;
  }
}

// As far as I can tell, in the version of interactjs we're using the TypeScript bindings are wrong
// interface FixedInteractable extends interact {
//   getRect(): interact.Rect & interact.Rect2;
//   unset(): FixedInteractable;
// }
