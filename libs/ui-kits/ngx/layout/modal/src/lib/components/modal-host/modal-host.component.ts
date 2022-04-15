import {
  Component,
  ComponentRef,
  HostListener,
  Injector,
  OnDestroy,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { MODAL_DATA } from '../../..';

@Component({
  selector: 'tamu-gisc-modal-host',
  templateUrl: './modal-host.component.html',
  styleUrls: ['./modal-host.component.scss']
})
export class ModalHostComponent implements OnDestroy {
  @ViewChild('modal', { static: true, read: ViewContainerRef })
  private _modalChildHost: ViewContainerRef;

  private _modalChildRef: ComponentRef<unknown>;

  public close: Subject<boolean> = new Subject();

  @HostListener('document:keyup.esc')
  public escDismiss() {
    this.clear();
  }

  public ngOnDestroy(): void {
    this.clear();
  }

  public mountModalChild<C>(component: Type<C>, data?: unknown): Observable<boolean> {
    console.log('Loading sub component');

    this._modalChildRef = this._modalChildHost.createComponent(component, {
      injector: Injector.create({
        providers: [
          {
            provide: MODAL_DATA,
            useValue: data
          }
        ],
        parent: this._modalChildHost.injector
      })
    });

    return this.close;
  }

  public clear() {
    this._modalChildHost.clear();
    this._modalChildRef.destroy();

    this.close.next(true);
    this.close.complete();
  }
}
