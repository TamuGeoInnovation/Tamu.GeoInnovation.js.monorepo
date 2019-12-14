import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Having to use a service due to some issues which may be a bug or lack of understanding, however, the
// while the parent accordion component registers a subscription against the accordion header toggle
// event emitter, it does not work with any components extending the accordion header component.
@Injectable()
export class AccordionService {
  private _expanded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public expanded: Observable<boolean> = this._expanded.asObservable();

  constructor() {}

  public toggle() {
    this._expanded.next(!this._expanded.getValue());
  }
}
