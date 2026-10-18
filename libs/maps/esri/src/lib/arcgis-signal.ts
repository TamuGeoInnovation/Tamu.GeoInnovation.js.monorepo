import { Signal, computed, effect, inject, signal } from '@angular/core';

import { EsriModuleProviderService } from './services/module-provider/module-provider.service';

import esri = __esri;

/**
 * A signal of what `read` returns, kept up to date as ArcGIS changes the objects it reads (#1673).
 *
 * ArcGIS changes its objects in place - a layer's `visible`, a list item's `updating`, a view model's
 * `activeBasemap` - and nothing tells Angular, so an OnPush template that reads them directly goes
 * stale until something else happens to redraw it. Read them through this instead. `read` is watched
 * with `reactiveUtils.watch`, which follows every ArcGIS property it touches, and it is read again
 * whenever an Angular signal it reads changes (an input given a new layer, say), which also moves the
 * watch onto the new objects.
 *
 * Return plain values, or new arrays (`collection.toArray()`), rather than an ArcGIS object or
 * collection that is itself changed in place: the signal changes only when what `read` returns does.
 * `read` must cope with its inputs being unset.
 *
 * Call it where `inject` works, such as a field initializer. The watch ends with the component.
 */
export function arcgisSignal<T>(read: () => T): Signal<T> {
  const modules = inject(EsriModuleProviderService);
  const changes = signal(0);

  effect((onCleanup) => {
    // Read here for the Angular signals `read` depends on: when one changes, the watch is made again,
    // on the objects `read` now reaches.
    read();

    let handle: { remove(): void } | undefined;
    let ended = false;

    modules.require(['reactiveUtils']).then(
      ([reactiveUtils]: [esri.reactiveUtils]) => {
        if (!ended) {
          // `initial` also counts as a change, which picks up anything changed while the module loaded.
          handle = reactiveUtils.watch(read, () => changes.update((count) => count + 1), { initial: true });
        }
      },
      (error) => console.error('Could not watch ArcGIS for changes.', error)
    );

    onCleanup(() => {
      ended = true;
      handle?.remove();
    });
  });

  return computed(() => {
    changes();

    return read();
  });
}
