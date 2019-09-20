import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, from, fromEventPattern, merge, NEVER } from 'rxjs';
import { mergeMap, filter, switchMap } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { LayerSource } from '@tamu-gisc/common/types';
import esri = __esri;

@Injectable()
export class LayerListService implements OnDestroy {
  private _store: BehaviorSubject<LayerListItem[]> = new BehaviorSubject([]);

  private _handles: esri.Handles;

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private environment: EnvironmentService
  ) {
    const LayerSources = this.environment.value('LayerSources');

    from(this.moduleProvider.require(['Handles'])).subscribe(([HandlesConstructor]: [esri.HandlesConstructor]) => {
      this._handles = new HandlesConstructor();
    });

    this.mapService.store.subscribe((res) => {
      // Perform a check against the map instance to add existing layers. Layers added after this
      // point will be handled by the change event.

      // Create a LayerListItem instance for each including the existing layer instance as a class property.
      const existing: LayerListItem[] = res.map.allLayers
        .filter((l) => {
          return l.listMode === 'show';
        })
        .toArray()
        .map((l) => {
          return new LayerListItem({ layer: l });
        });

      // Determine layers in layer sources that are listed as show, but are being makred as lazy loaded.
      // Create a LayerListItem instance for each, leaving the layer property undefined.
      // This will be used as a flag to determine whether a layer needs to be lazy-loaded
      const nonExisting: LayerListItem[] = LayerSources.filter((s) => {
        return s.listMode === 'show' && existing.findIndex((el) => s.id === el.id) === -1;
      }).map((l) => {
        return new LayerListItem(l);
      });

      // Concatenate the existing (true layer instances) and non existing layers (layer references to be lazy-loaded)
      this._store.next([...existing, ...nonExisting]);

      // Event handler that listens for layer changes in the map instance
      res.map.allLayers.on('change', (e: any) => {
        // Handle added layers case
        if (e.added) {
          // Each event only has the layers for that particular event. It does not include layers in
          // previous events, so some processing must be done to ensure all layers added are either added
          // or updated properly in the service state.

          // Create a copy of the service store and update items if the current event has layers that have
          // been  previously added to the store.
          const updatedLayers = this._store.value.map((lyr) => {
            const existingIndex = e.added.findIndex((added) => added.id === lyr.id);

            if (existingIndex > -1) {
              return new LayerListItem({ ...lyr, layer: e.added[existingIndex] });
            } else {
              return lyr;
            }
          });

          // Layers that are not found in the service should simply be added.
          const newLayers = e.added
            .filter((al) => al.listMode === 'show' && this._store.value.findIndex((cl) => cl.id === al.id) === -1)
            .map((l: esri.Layer) => {
              return new LayerListItem({ layer: l });
            });

          // Concatenate updated and new layers, and set it to be the new store value.
          this._store.next([...updatedLayers, ...newLayers]);
        }

        // Handle removed layers case
        if (e.removed && e.removed.length > 0) {
          const minusRemoved = this._store.value.filter((l) => {
            return e.removed.findIndex((rl) => l.id === rl.id) === -1;
          });

          this._store.next(minusRemoved);
        }
      });
    });
  }

  public ngOnDestroy() {
    // Clean up all layer handle references.
    this._handles.removeAll();
  }

  /**
   * Returns a collection of LayerListItems and emits whenever there is a change (add/removal)
   * in map layers. Does not notify on layer property changes, by default.
   *
   * For the subscriber to receive notifications on property changes, provide a string or an
   * array of property paths to the layers to be watched. If the property is valid, whenever
   * it changes, it will trigger a subscription event.
   *
   */
  public layers(watchProperties?: string | string[]): Observable<LayerListItem[]> {
    return (
      merge(
        this._store.pipe(
          switchMap((list) => from(list)),
          // Do not process any layer list items with an undefined layer definition.
          filter((item) => item.layer !== undefined),
          mergeMap((item) => {
            if (watchProperties) {
              const handleKey = `${item.id}-${
                typeof watchProperties === 'string' ? watchProperties.toString() : watchProperties.join('-')
              }`;

              /**
               * Adds a watch handler to the layer for the property provided if it does not exist yet.
               *
               * Function gets called when a new layer is added to the map.
               *
               */
              const add = (handler) => {
                if (!this._handles.has(handleKey)) {
                  const handle = item.layer.watch(watchProperties, handler);
                  this._handles.add(handle, handleKey);
                }
              };

              /**
               * Destroys a property watch handler for a layer by handleKey if it exists.
               *
               * Function executed whenever the source observable is unsubscribed from.
               *
               */
              const remove = (handler): void => {
                if (this._handles.has(handleKey)) {
                  this._handles.remove(handleKey);
                }
              };

              // For every item, attempt to create a layer
              return fromEventPattern(add, remove);
            } else {
              return NEVER;
            }
          })
        ),
        this._store
      )
        // Normalize either emission by mapping to the exposed store observable.
        .pipe(switchMap(() => this._store.asObservable()))
    );
  }
}

export class LayerListItem {
  public id: LayerSource['id'];
  public title: LayerSource['title'];
  public layer: esri.Layer;
  public category: LayerSource['category'];

  constructor(props: { id?: string; title?: string; layer?: esri.Layer; category?: string }) {
    this.layer = props.layer;

    // If a layer is provided, inherit layer properties, else set
    if (props.layer) {
      this.id = props.layer.id;
      this.title = props.layer.title;
      this.category = props.category;
    } else {
      this.id = props.id || '';
      this.title = props.title || '';
      this.category = props.category;
    }
  }
}

export interface LayerListStore {
  categories: LayerListCategory[];
}

export interface LayerListCategory {
  title: string;
  layers: LayerListItem[];
  expanded: boolean;
}
