import { Component, Type, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'tamu-gisc-modal-host',
  templateUrl: './modal-host.component.html',
  styleUrls: ['./modal-host.component.scss']
})
export class ModalHostComponent {
  @ViewChild('modal', { static: true, read: ViewContainerRef })
  private _modalChildHost: ViewContainerRef;

  public mountModalChild<C>(component: Type<C>) {
    console.log('Loading sub component');

    this._modalChildHost.createComponent(component);
  }
}

