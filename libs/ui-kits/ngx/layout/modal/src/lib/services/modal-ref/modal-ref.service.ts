import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service that functions as a bridge between a ModalHostComponent and its instantiated inner instance.
 *
 * Allows the inner instance to close the modal and pass back data.
 *
 * This service should be injected into any component that is instantiated by the modal service.
 */
@Injectable({
  providedIn: 'root'
})
export class ModalRefService {
  public closeSignal: Subject<unknown> = new Subject();

  /**
   * Informs the subscribed ModalHostComponent that the inner instance has requested
   * a close event with optional provided data.
   */
  public close(d?: unknown) {
    this.closeSignal.next(d);
  }
}

