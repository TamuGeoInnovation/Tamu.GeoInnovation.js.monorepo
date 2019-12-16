import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, from, fromEventPattern, merge, NEVER, MonoTypeOperatorFunction, of } from 'rxjs';
import { mergeMap, filter, switchMap, scan, take, toArray } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { LayerSource } from '@tamu-gisc/common/types';
import esri = __esri;

@Injectable()
export class LayerListService implements OnDestroy {
  private _store: BehaviorSubject<LayerListItem<esri.Layer>[]> = new BehaviorSubject([]);

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
      const existing: LayerListItem<esri.Layer>[] = res.map.allLayers
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
      const nonExisting: LayerListItem<esri.Layer>[] = LayerSources.filter((s) => {
        return s.listMode === 'show' && existing.findIndex((el) => s.id === el.id) === -1;
      }).map((l) => {
        return new LayerListItem(l);
      });

      // Concatenate the existing (true layer instances) and non existing layers (layer references to be lazy-loaded)
      this._store.next([...existing, ...nonExisting]);

      // Event handler that listens for layer changes in the map instance
      res.map.allLayers.on('change', (e) => {
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
  public layers(props?: ILayerSubscriptionProperties): Observable<LayerListItem<esri.Layer>[]> {
    return (
      merge(
        this._store.pipe(
          this.filterLayers(props, true),
          switchMap((filtered) => from(filtered)),
          mergeMap((item) => {
            if (props && props.watchProperties) {
              const handleKey = `${item.id}-${
                typeof props.watchProperties === 'string'
                  ? props.watchProperties.toString()
                  : props.watchProperties.join('-')
              }`;

              /**
               * Adds a watch handler to the layer for the property provided if it does not exist yet.
               *
               * Function gets called when a new layer is added to the map.
               *
               */
              const add = (handler) => {
                if (!this._handles.has(handleKey)) {
                  const handle = item.layer.watch(props.watchProperties, handler);
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
        .pipe(
          this.mapLayerChangeEvent(),
          this.filterLayers(props, false)
        )
    );
  }

  /**
   * RxJS operator responsible for normalizing and  mapping a layer change event emission to a LayerListItem collection.
   *
   * The `layers` method subscribes to both layer add/removal activity on the map OR layer property watches. Since their respective
   * emissions are different, they have to be normalized before any subscribers can process the value.
   *
   */
  private mapLayerChangeEvent(): MonoTypeOperatorFunction<LayerListItem<esri.Layer>[] | esri.WatchCallback> {
    return ($input) =>
      $input.pipe(
        switchMap((collection) => {
          // Check if the array is a collection of LayerListItem
          // One of two conditions must be met:
          //
          // Collection is of length zero, which means there are no layers added to the map yet. We still  want an emission out
          // of an empty LayerListItem colleciton. In addition, if the collection is empty it cannot be an esri WatchCallback because
          // the length of that array is known.
          if (collection.length === 0 || (<LayerListItem<esri.Layer>[]>collection).some((i) => i instanceof LayerListItem)) {
            return of(collection);
          } else {
            // If the collection is not a list of LayerListItem, then it is a collection with esri WatchCallback values.
            //
            // To avoid multiple emissions for every layer despite having a single WatchHandle event, limit the LayerListItem
            // collection to be only the affeted LayerListItems
            return this._store.asObservable().pipe(
              take(1),
              switchMap((list) => from(list)),
              filter((item) => {
                // Item at index 3 is the `target` layer object reference that contains an id property.
                return item.id === collection[3].id;
              }),
              toArray()
            );
          }
        })
      );
  }

  /**
   * RxJS operator that filters a collection of LayerListItem's
   *
   * @param {ILayerSubscriptionProperties} props The `layers` property is used from this object
   * to reduce the original collection.
   * @param {boolean} filterLazy If `true` will ignore lazy load layers during the filtering. This is used internally
   * to prevent errors and unecessary layer watch handles from being created. When `false`, all layers will be processed,
   * and will not filter out layers marked for lazy loading which is useful to get a full list of layers for UI presentation,
   * for example.
   */
  private filterLayers(
    props: ILayerSubscriptionProperties,
    filterLazy: boolean
  ): MonoTypeOperatorFunction<LayerListItem<esri.Layer>[]> {
    return (input$) =>
      input$.pipe(
        switchMap((list) => from(list)),
        filter((item) => {
          if (item.layer === undefined && filterLazy) {
            return false;
          }

          if (props === undefined || props.layers === undefined) {
            return true;
          }

          if (typeof props.layers === 'string') {
            return props.layers === item.id;
          } else if (props.layers instanceof Array) {
            return props.layers.includes(item.id);
          } else {
            throw new Error(`Unexpected input parameter: ${JSON.stringify(props.layers)}`);
          }
        }),
        // Since the source observable (service store), never completes a simple toArray() will not work here.
        //
        // It's possible to achieve the same end-result with the scan operator that collects stream emissions over time.
        scan((acc, curr) => {
          // Check if the accumulated value contains the current layer by id
          const existingIndex = acc.findIndex((layer) => layer.id === curr.id);

          // If the existing index already has a defined layer, return the current accumulated value
          // Since layers will always be references, their state value is handled by the API.
          // We only need to make sure that our LayerListItem has the layer definition.
          if (existingIndex > -1 && acc[existingIndex].layer !== undefined) {
            return acc;
          }

          // If it does exist, and we reached this block it means the existingIndex LayerListItem does not have a layer
          // reference. In that case, apply the reference.
          //
          // If the existingIndex is out of bounds (-1), then the LayerListItem does not exist in the accumulator. In this case, add it.
          if (existingIndex > -1 && acc[existingIndex].layer === undefined) {
            acc.splice(existingIndex, 1, curr);
            return [...acc];
          } else {
            return [...acc, curr];
          }
        }, [])
      );
  }
}

export class LayerListItem<T extends esri.Layer> {
  public id: LayerSource['id'];
  public title: LayerSource['title'];
  public layer: T;
  public category: LayerSource['category'];

  constructor(props: { id?: string; title?: string; layer?: T; category?: string }) {
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

export interface LayerListStore<T extends esri.Layer> {
  categories: LayerListCategory<T>[];
}

export interface LayerListCategory<T extends esri.Layer> {
  title: string;
  layers: LayerListItem<T>[];
  expanded: boolean;
}

export interface ILayerSubscriptionProperties {
  /**
   * Lqyer ID or ID's that will be returned with the subscription.
   *
   * Will default to return all layers.
   *
   * @type {(string | string[])}
   * @memberof ILayerSubscriptionProperties
   */
  layers?: string | string[];

  /**
   * List of layer properties that trigger a state emission.
   *
   * @type {(string | string[])}
   * @memberof ILayerSubscriptionProperties
   */
  watchProperties?: string | string[];
}
