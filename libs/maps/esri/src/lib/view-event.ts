import { Observable, filter, fromEventPattern, map, switchMap } from 'rxjs';

import { MapServiceInstance } from './services/map/map.service';

import esri = __esri;

/**
 * A map view's events as an observable, in place of the `fromEventPattern` wrapper written by hand (#3493).
 *
 * `view.on(name, handler)` returns a handle that has to be kept and removed again, so every caller wrote the same
 * fifteen lines: a `let handle`, an `add` that assigns it, a `remove` that calls `handle.remove()`, and
 * `fromEventPattern(add, remove)`. It was in five places - the click coordinates component, the phone's trip-planner
 * top bar, the viewfinder twice, and the trip planner service - and one of them had a fault the others did not, which
 * is the usual cost of a copy: a `remove` that calls `handle.remove()` without checking the handle exists throws when
 * a subscription ends before ArcGIS has handed one over.
 *
 * Use it inside the `switchMap` over a map store, so a view swap resubscribes, exactly as the hand-written copies did:
 *
 * ```ts
 * this.$mapView.pipe(switchMap((view) => viewEvent<esri.ViewClickEvent>(view, 'click')));
 * ```
 */
export function viewEvent<T>(view: MapServiceInstance['view'], name: string): Observable<T> {
  // `on` is overloaded per event name, and the name here is a parameter, so neither overload applies.
  const on = view.on as unknown as (event: string, handler: (value: T) => void) => esri.Handle;

  // The handle is per subscription: `fromEventPattern` hands `remove` whatever `add` returned, so each subscriber
  // removes its own. One kept in a variable here was shared by every subscriber to this observable, and the first to
  // leave took the last one's handler off the view and left its own registered (#3693). `watchAsObservable` is written
  // the same way.
  const add = (handler: (value: T) => void) => on.call(view, name, handler);

  // A subscription can end before ArcGIS returns the handle, and then there is nothing to remove.
  const remove = (_handler: (value: T) => void, handle?: esri.Handle) => handle?.remove();

  return fromEventPattern<T>(add, remove);
}

/**
 * The same, taken straight from a map store: the view is read out of the store's instances and an absent one is
 * skipped rather than reached into.
 *
 * The trip planner service's copy of this read `instances?.view` and then called `view.on(...)` on it, so an emission
 * with no view threw. Nothing else guarded it either, because each copy was written where a view was known to exist.
 */
export function viewEventFromStore<T>(store: Observable<MapServiceInstance>, name: string): Observable<T> {
  return store.pipe(
    map((instances) => instances?.view),
    filter((view): view is MapServiceInstance['view'] => view !== undefined && view !== null),
    switchMap((view) => viewEvent<T>(view, name))
  );
}
