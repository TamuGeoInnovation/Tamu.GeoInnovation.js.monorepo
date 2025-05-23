import { Component, Inject, Input, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { ModalRefService } from '../../services/modal-ref/modal-ref.service';
import { MODAL_DATA } from '../../tokens/modal.tokens';

@Component({
  selector: 'tamu-gisc-generic-modal',
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent<T> implements OnInit {
  @Input()
  public ctx: Observable<T>;

  public body: Observable<string>;

  constructor(@Inject(MODAL_DATA) public readonly data: GenericModalContext<T>, private readonly mrs: ModalRefService) {}

  public ngOnInit(): void {
    if (this.data.context) {
      // Wrap the context in an observable if it is not already one
      const ctx = this.data.context instanceof Observable ? this.data.context : of(this.data.context);

      this.body = ctx.pipe(
        map((ctx) => {
          if (typeof this.data.body === 'function') {
            return this.data.body(ctx);
          } else {
            return this.data.body;
          }
        })
      );
    }
  }

  public callAction(value?: GenericModalAction['value']) {
    this.mrs.close(value);
  }
}

export interface GenericModalContext<T> {
  /**
   * The title of the modal.
   */
  title: string;

  /**
   * Modal sub title
   */
  subTitle?: string;

  /**
   * Primary modal content.
   *
   * Supports static string or a function that returns a string.
   *
   * If a function is provided, it will be called with the context object.
   *
   * Markdown and HTML are supported.
   *
   * @example
   * ```typescript
   * body: (ctx) => `Hello ${ctx.name}`
   * ```
   */
  body: string | ((ctx: T) => string);

  /**
   * The context object to be passed to the body function.
   *
   * Supports both static objects and observables.
   * If an observable is provided, it will be subscribed to and the latest value will be passed to the body function.
   */
  context?: T | Observable<T>;

  /**
   * Generic popup supports a list of button actions that return a registered value on selection.
   */
  actions?: {
    /**
     * ** NOT IMPLEMENTED **
     *
     * For modals with additional confirmation requirements, a matcher definition can be provided.
     *
     * This matcher will be called with the context object and should return a boolean value.
     *
     * If the matcher returns true, the modal will be closed and the action will be executed.
     *
     * If the matcher returns false, the modal will not be closed and the action will not be executed.
     *
     */
    matcher?: unknown;

    /**
     * Collection of at least one button, each capable of being styled differently,
     * and returning different values depending on the application.
     *
     * These buttons will always be displayed in the footer of the modal.
     */
    buttons: Array<GenericModalAction>;
  };
}

interface GenericModalAction {
  label: string;
  value: boolean | string | number;
  style: 'default' | 'secondary' | 'success' | 'danger' | 'warning';
}
