import { Injectable } from '@angular/core';
import { Router, Event } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { filter, pluck, last, mergeMap, take } from 'rxjs/operators';

const initial: RouterHistoryState = { historyEvents: [] };

@Injectable({ providedIn: 'root' })
export class RouterHistoryService {
  private _$state: BehaviorSubject<RouterHistoryState> = new BehaviorSubject(initial);
  public history: Observable<RouterHistoryState> = this._$state.asObservable();

  constructor(private router: Router) {
    router.events
      .pipe(
        filter((event) => {
          return event.constructor.name === 'NavigationEnd';
        })
      )
      .subscribe((navigationEndEvent) => {
        // Copy the state
        const nst = { ...this._$state.value };

        // Push shallow copy of current navigation event to new state history events array.
        nst.historyEvents.push({ ...navigationEndEvent });

        // Set new state value
        this._$state.next(nst);
      });
  }

  /**
   * Returns an observable with the
   */
  public last(): Observable<Event> {
    return this.history.pipe(
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
