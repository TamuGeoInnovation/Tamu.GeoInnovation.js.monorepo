import { DOCUMENT } from '@angular/common';
import { ComponentRef, Inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ModalHostComponent } from '../../components/modal-host/modal-host.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _viewRef: ViewContainerRef;
  private _modalRef: ComponentRef<ModalHostComponent>;

  private _isOpen = new BehaviorSubject<boolean>(false);

  /**
   * Whether a modal is currently mounted.
   *
   * For anything that must get out of the way of a modal rather than draw over or under it. The
   * grouped notifications use it: an event map can open a venue change or an event-passed warning the
   * moment it loads, and a stack of toasts underneath that is both unreadable and beside the point.
   * See #1246.
   */
  public readonly isOpen: Observable<boolean> = this._isOpen.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Registers the global view container ref that will be used for all modal `open` calls
   * unless an override is specified in that call.
   *
   * Recommendation: Register a global view ref in the root-most component possible.
   */
  public registerGlobalViewRef(ref: ViewContainerRef) {
    this._viewRef = ref;
  }

  public open<T>(component: Type<unknown>, options?: ModalOpenOptions): Observable<T> {
    if (options && options.viewRef) {
      this._modalRef = options.viewRef.createComponent(ModalHostComponent);

      this.listenForChildClose();
    } else if (this._viewRef) {
      this._modalRef = this._viewRef.createComponent(ModalHostComponent);

      this.listenForChildClose();
    } else {
      throw new Error('No view ref configured for modal. Register a global viewRef or provide one in the open function.');
    }

    // Lock the rest of the page from being able to be scrolled. This class styles are defined in the
    // modal host component.
    this.document.body.classList.add('modal-open');

    this._isOpen.next(true);

    // Pass in provided data to the host component which will pass it down to the actual inner
    // modal component.
    //
    // The return value is an `close` event observable from the ModalHostComponent that
    // hosts the provided component as a child.
    return this._modalRef.instance.mountModalChild(component, options?.data) as Observable<T>;
  }

  private listenForChildClose() {
    this._modalRef.instance.close.subscribe(() => {
      // Destroy the ModalHostComponent when the inner modal ref instance is destroyed.
      this._modalRef.destroy();

      // Re-enable page scrolling
      this.document.body.classList.remove('modal-open');

      this._isOpen.next(false);
    });
  }
}

export interface ModalOpenOptions {
  /**
   * View container ref where the modal host is created.
   *
   * Suggest registering a global instance on the app root so the modal host
   * is rendered as a sibling of the app root instead of inside of another component
   * which won't necessarily cover the entire viewport.
   */
  viewRef?: ViewContainerRef;

  /**
   * Data that should be passed down to the provided inner modal component.
   *
   * Passed in data is available in the inner modal component through the `MODAL_DATA` provider.
   */
  data: unknown;
}
