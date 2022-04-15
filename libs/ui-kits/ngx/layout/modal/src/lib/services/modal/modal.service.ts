import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';

import { ModalHostComponent } from '../../components/modal-host/modal-host.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _viewRef: ViewContainerRef;
  private _modalRef: ComponentRef<ModalHostComponent>;

  public registerGlobalViewRef(ref: ViewContainerRef) {
    this._viewRef = ref;
  }

  public open<C>(component: Type<C>, options?: ModalOpenOptions) {
    if (options && options.viewRef) {
      this._modalRef = options.viewRef.createComponent(ModalHostComponent);

      this.listenForChildClose();
    } else if (this._viewRef) {
      this._modalRef = this._viewRef.createComponent(ModalHostComponent);

      this.listenForChildClose();
    } else {
      throw new Error('No view ref configured for modal. Register a global viewRef or provide one in the open function.');
    }

    // Pass in provided data to the host component which will pass it down to the actual inner
    // modal component.
    return this._modalRef.instance.mountModalChild(component, options?.data);
  }

  private listenForChildClose() {
    this._modalRef.instance.close.subscribe((result) => {
      this._modalRef.destroy();
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
