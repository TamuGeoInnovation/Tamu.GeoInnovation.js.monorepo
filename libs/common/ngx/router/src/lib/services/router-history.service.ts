import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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
        // Typed as the NavigationEnd it is, so subscribers can read its url. Angular 16 widened the router's
        // Event union to include events that have none (#1343). The check itself is unchanged.
        filter((event): event is NavigationEnd => {
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
  public last(): Observable<NavigationEnd> {
    return this.history.pipe(
      pluck('historyEvents'),
      mergeMap((arr) => from(arr.reverse())),
      take(2),
      last()
    );
  }
}

export interface RouterHistoryState {
  historyEvents: Array<NavigationEnd>;
}
