import { Observable, fromEventPattern } from 'rxjs';

import esri = __esri;

/**
 * What `read` returns, as an observable that emits each time ArcGIS changes it, in place of the `fromEventPattern`
 * wrapper written by hand around `reactiveUtils.watch` (#3592).
 *
 * `reactiveUtils.watch(read, handler)` returns a handle that has to be kept and removed again, so each caller wrote the
 * same lines: a `let handle`, an `add` that assigns it, a `remove` that calls `handle.remove()`, and
 * `fromEventPattern(add, remove)`. The layer list and the legend each had a copy, and both had the fault `viewEvent`'s
 * five copies had (#3493): a `remove` that calls `handle.remove()` without checking the handle exists throws when a
 * subscription ends before ArcGIS has handed one over.
 *
 * **It emits on a change only, never on subscribe.** Give it the first value with `startWith`: the layer list starts
 * from `-1` and the legend from `undefined`, so a first value folded in here would fit neither.
 *
 * **`arcgisSignal` is the other half of this pair.** It watches the same way and gives a signal, for an OnPush template
 * that reads ArcGIS objects (#1673). Pick by what the caller needs: this one to pipe, that one to read in a template.
 *
 * `reactiveUtils` is passed in because it is loaded through `EsriModuleProviderService` with the other modules:
 *
 * ```ts
 * watchAsObservable(reactiveUtils, () => model.operationalItems.map((item) => item.title).join('\n')).pipe(startWith(-1));
 * ```
 */
export function watchAsObservable<T>(reactiveUtils: esri.reactiveUtils, read: () => T): Observable<T> {
  // `fromEventPattern` hands `remove` whatever `add` returned, so each subscription removes its own handle; a handle
  // kept in one variable here would be shared by every subscriber, and the first to leave would end the last one's watch.
  const add = (handler: (value: T) => void) => reactiveUtils.watch(read, handler);

  // A subscription can end before ArcGIS returns the handle, and then there is nothing to remove.
  const remove = (_handler: (value: T) => void, handle?: esri.WatchHandle) => handle?.remove();

  return fromEventPattern<T>(add, remove);
}
