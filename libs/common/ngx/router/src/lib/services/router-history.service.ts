import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { filter, pluck, last, mergeMap, take } from 'rxjs/operators';

const initial: RouterHistoryState = { historyEvents: [] };

@Injectable({ providedIn: 'root' })
export class RouterHistoryService {
  private router = inject(Router);

  private _$state: BehaviorSubject<RouterHistoryState> = new BehaviorSubject(initial);
  public history: Observable<RouterHistoryState> = this._$state.asObservable();

  constructor() {
    const router = this.router;

    router.events
      .pipe(
        // instanceof, not the class name: production builds minify class names, so NavigationEnd is
        // called something like `Wn` there and a name check never matched. The history stayed empty on
        // production while working in development builds (#1348).
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((navigationEndEvent) => {
        // A new array each time. Pushing onto the existing one mutated `initial`, which every instance
        // of this service starts from, so a second instance inherited the first one's history (#1348).
        this._$state.next({ historyEvents: [...this._$state.value.historyEvents, { ...navigationEndEvent }] });
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
