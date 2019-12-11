import { Directive, AfterViewInit, ElementRef, AfterViewChecked, OnDestroy, Input } from '@angular/core';

import { UIDragService, UIDragState } from '../services/ui/ui-drag.service';

import * as interact from 'interactjs';

@Directive({
  selector: '[draggable]'
})
export class DraggableDirective implements AfterViewInit, AfterViewChecked, OnDestroy {
  /**
   * Unique component identifier generated when the component register with the UI drag service.
   *
   * @type {string}
   * @memberof DraggableDirective
   */
  @Input('draggableIdentifier') public identifier: string;

  /**
   * Represents y-offset that is initially present when the element is rendered.
   *
   * @type {number}
   * @memberof PopupMobileComponent
   */
  public initialOffset: number;

  /**
   * Calcuated inner or outer screen height for both Android and iOS devices.
   *
   * @type {number}
   * @memberof DraggableDirective
   */
  public deviceHeight: number;

  /**
   * Draggable event reference. Needs to be stored in variable in order to destroy event handlers on component destroy.
   *
   * @private
   * @type {*}
   * @memberof DraggableDirective
   */
  private draggable: FixedInteractable;

  private lastContentHeight: number;

  constructor(private el: ElementRef, private dragService: UIDragService) {
    // this.draggable = el;
  }

  public ngAfterViewInit() {
    if (!this.identifier) {
      console.warn(
        'Draggable directive was not provided a component identifier. Provide an identifier with the [draggableIdentifier] property.'
      );
    }

    this.draggable = <FixedInteractable>interact('.draggable').draggable({
      inertia: true,
      restrict: {
        restriction: 'self'
      }
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
      this.deviceHeight = window.outerHeight > 0 ? window.outerHeight : window.innerHeight;
      this.initialOffset = this.deviceHeight - this.draggable.getRect().top;
    }

    // Handle inner content changes that would cause a dragged element to float if the new height is less than the last
    if (this.el.nativeElement.innerText.trim() !== '') {
      const rect = this.draggable.getRect();

      if (rect) {
        if (this.lastContentHeight && this.lastContentHeight !== Math.floor(rect.height)) {
          if (this.draggable.getRect().bottom < window.innerHeight) {
            const anchor = this.initialOffset - this.draggable.getRect().height;

            (<HTMLElement>this.el.nativeElement).setAttribute('data-y', anchor.toString());
            (<HTMLElement>this.el.nativeElement).style.transform = 'translate(0px, ' + anchor + 'px)';
          }
        }

        this.lastContentHeight = Math.floor(this.draggable.getRect().height);
      }
    }
  }

  public ngOnDestroy() {
    this.draggable = this.draggable.unset();
  }

  /**
   * Handles element repositioning on element swipe to drag.
   *
   * @param {*} event
   * @memberof DraggableDirective
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

      const position = this.draggable.getRect();

      const limitReached = this.deviceHeight - Math.floor(position.top) <= this.initialOffset;

      if (!limitReached) {
        // console.log('speed down', event.speed)

        // Set transition
        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + y + 'px)';

        // Set peristent values
        target.setAttribute('data-y', y);
      } else {
        target.style.webkitTransform = target.style.transform = 'translate(0px, ' + '0px)';

        target.setAttribute('data-y', 0);

        event.interaction.stop();
      }
    } else if (event.dy < 0) {
      // Swipe up
      const limitOffset = Math.floor(-(event.target.offsetHeight - Math.floor(this.initialOffset))) + 2;

      // If the limit has been reached, and the action is an upward movement
      // Do not attempt to reposition the element as it has nowhere to go
      if (event.target.getAttribute('data-y') !== limitOffset) {
        // console.log('speed up', event.speed)

        // Limit has not been reached, continue to scroll until the limit is reached
        const target = event.target,
          // Get dragged values from attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Get current element position
        // const position = ( < HTMLElement > event.target).getBoundingClientRect();
        const position = this.draggable.getRect();
        const limitReached = this.deviceHeight - Math.floor(position.top) >= Math.ceil(position.height);

        // If limit is not reached, simply update the object coordinates
        if (!limitReached) {
          target.style.webkitTransform = target.style.transform = 'translate(0px, ' + y + 'px)';

          target.setAttribute('data-y', y);
        } else {
          // If the limit is reached, update the coordinates to by those of maximum element
          // offset and cancel any other events.
          if (target.getAttribute('data-y') !== limitOffset) {
            target.style.webkitTransform = target.style.transform = 'translate(0px, ' + limitOffset + 'px)';

            target.setAttribute('data-y', limitOffset);

            event.interaction.end();
          }
        }
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
    return 100 - (this.draggable.getRect().top / (this.deviceHeight - this.initialOffset)) * 100;
  }
}

// As far as I can tell, in the version of interactjs we're using the TypeScript bindings are wrong
interface FixedInteractable extends interact.Interactable {
  getRect(): interact.Rect & interact.Rect2;
  unset(): FixedInteractable;
}
