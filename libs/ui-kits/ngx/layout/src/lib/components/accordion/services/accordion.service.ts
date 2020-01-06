import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Having to use a service due to some issues which may be a bug or lack of understanding, however, the
// while the parent accordion component registers a subscription against the accordion header toggle
// event emitter, it does not work with any components extending the accordion header component.
@Injectable()
export class AccordionService {
  private _state: BehaviorSubject<IAccordionModel> = new BehaviorSubject({ expanded: false, animate: false, resize: false });
  public state: Observable<IAccordionModel> = this._state.asObservable();

  /**
   *  Updates the accordion component state, by object spreading (New -> Old).
   */
  public update(settings: IAccordionModel) {
    this._state.next({ ...this._state.getValue(), ...settings });
  }

  /**
   *  Flips the value of the provided accordion  model key.
   */
  public toggle(property: keyof IAccordionModel) {
    const updated = this._state.getValue();

    updated[property] = !updated[property];

    this._state.next(updated);
  }
}

export interface IAccordionModel {
  expanded: boolean;

  /**
   * If `true`, detects accordion children content changes and fires off an accordion resize.
   *
   * Defaults to `false`.
   */
  resize: boolean;

  /**
   * Determines if the accordion animate when expanding or collapsing.
   *
   * Animation is not always ideal, especially when components are re-rendered on change
   * detection cycles which would cause the accordion to flash open or closed abruptly.
   */
  animate: boolean;
}
