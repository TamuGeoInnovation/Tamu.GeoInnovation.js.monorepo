import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';

import { ModalHostComponent } from '../../components/modal-host/modal-host.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _viewRef: ViewContainerRef;
  private _modalRef: ComponentRef<ModalHostComponent>;

  public registerGlobalViewRef(ref: ViewContainerRef) {
    this._viewRef = ref;
  }

  public open<C>(component: Type<C>) {
    console.log('Opening modal host with component', component.name);

    this._modalRef = this._viewRef.createComponent(ModalHostComponent);

    this._modalRef.instance.mountModalChild(component);
  }
}
