import { DOCUMENT } from '@angular/common';
import { ComponentRef, Inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';

import { ModalHostComponent } from '../../components/modal-host/modal-host.component';
import { GenericModalComponent, GenericModalContext } from '../../components/generic-modal/generic-modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _viewRef: ViewContainerRef;
  private _modalRef: ComponentRef<ModalHostComponent>;

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

  public open<ReturnType>(
    componentOrGenericContext: Type<unknown>,
    options?: ModalOpenOptions<Record<string, unknown>>
  ): Observable<ReturnType>;
  public open<PayloadType, ReturnType>(
    componentOrGenericContext: GenericModalContext<PayloadType>,
    options?: ModalOpenOptions<PayloadType>
  ): Observable<ReturnType>;
  public open<PayloadType, ReturnType>(
    componentOrGenericContext: Type<unknown> | GenericModalContext<PayloadType>,
    options?: ModalOpenOptions<PayloadType>
  ): Observable<ReturnType> {
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

    // If componentOrGenericContext is a class (not an object), then we need to create a new instance
    // of the component and pass it to the modal host.
    if (typeof componentOrGenericContext === 'function') {
      // Pass in provided data to the host component which will pass it down to the actual inner
      // modal component.
      //
      // The return value is an `close` event observable from the ModalHostComponent that
      // hosts the provided component as a child.

      return this._modalRef.instance.mountModalChild(componentOrGenericContext, options?.data) as Observable<ReturnType>;
    } else if (typeof componentOrGenericContext === 'object') {
      // If componentOrGenericContext is an object, then we need to pass it to the modal host as a
      // generic context.
      return this._modalRef.instance.mountModalChild(
        GenericModalComponent,
        componentOrGenericContext
      ) as Observable<ReturnType>;
    } else {
      throw new Error('Invalid component or generic context provided to modal service.');
    }
  }

  private listenForChildClose() {
    this._modalRef.instance.close.subscribe(() => {
      // Destroy the ModalHostComponent when the inner modal ref instance is destroyed.
      this._modalRef.destroy();

      // Re-enable page scrolling
      this.document.body.classList.remove('modal-open');
    });
  }
}

export interface ModalOpenOptions<T> {
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
  data: T | Observable<T>;
}
