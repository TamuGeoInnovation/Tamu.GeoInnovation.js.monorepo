import { Injectable } from '@angular/core';
import { Router, Event } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { filter, pluck, last, mergeMap, take } from 'rxjs/operators';

const initialHistoryState: RouterHistoryState = { historyEvents: [] };

@Injectable()
export class RouterHistoryService {
  private _state: BehaviorSubject<RouterHistoryState> = new BehaviorSubject(initialHistoryState);
  private _state$: Observable<RouterHistoryState> = this._state.asObservable();

  constructor(private router: Router) {
    router.events
      .pipe(
        filter((event) => {
          return event.constructor.name === 'NavigationEnd';
        })
      )
      .subscribe((navigationEndEvent) => {
        // Copy the state
        const nst = { ...this._state.value };

        // Push shallow copy of current navigation event to new state history events array.
        nst.historyEvents.push({ ...navigationEndEvent });

        // Set new state value
        this._state.next(nst);
      });
  }

  /**
   * Returns an observable with the
   *
   * @returns
   * @memberof RouterHistoryService
   */
  public last(): Observable<Event> {
    return this._state$.pipe(
      pluck('historyEvents'),
      mergeMap((arr) => from(arr.reverse())),
      take(2),
      last()
    );
  }
}

export interface RouterHistoryState {
  historyEvents: Array<Event>;
}
