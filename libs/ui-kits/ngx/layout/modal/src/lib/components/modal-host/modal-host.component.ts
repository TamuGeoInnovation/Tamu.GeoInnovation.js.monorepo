import {
  Component,
  ComponentRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

import { MODAL_DATA } from '../../..';
import { ModalRefService } from '../../services/modal-ref/modal-ref.service';

@Component({
  selector: 'tamu-gisc-modal-host',
  templateUrl: './modal-host.component.html',
  styleUrls: ['./modal-host.component.scss'],
  providers: [ModalRefService]
})
export class ModalHostComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true, read: ViewContainerRef })
  private _modalChildHost: ViewContainerRef;

  private _modalChildRef: ComponentRef<unknown>;

  public close: Subject<unknown> = new Subject();

  @HostListener('document:keyup.esc')
  public escCancel() {
    this.cancelModal();
  }

  constructor(private modalRef: ModalRefService) {}

  public ngOnInit(): void {
    // Create a subscription to the modalRef service and listen for close requests
    // from the inner component instance.
    this.modalRef.closeSignal.pipe(takeUntil(this.close)).subscribe((t) => {
      this.clear(t, true);
    });
  }

  public ngOnDestroy(): void {
    this.clear(undefined, false);
  }

  /**
   * Creates a provided component instance into the inner childe modal view container.
   */
  public mountModalChild<C, T>(component: Type<C>, data?: unknown): Observable<T> {
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

    return this.close as Observable<T>;
  }

  /**
   * Clears the inner child host views and any instanced component references.
   *
   * This method is the last step before the modal service dispatches a `closed`
   * event to the original component that called for the modal instantiation.
   *
   * At this stage, data can also be sent back to the server which pass it back to that
   * original caller.
   */
  public clear(exitData?: unknown, emit?: boolean) {
    if (this._modalChildHost.length > 0) {
      this._modalChildHost.clear();
    }

    if (this._modalChildRef) {
      this._modalChildRef.destroy();
    }

    if (emit) {
      this.close.next(exitData);
      this.close.complete();
    }
  }

  /**
   * Utility member that calls the `clear` class with the parameters to inform the
   * caller about an aborted modal event which differs from a non-null modal close
   * event.
   */
  public cancelModal() {
    this.clear(undefined, true);
  }
}
