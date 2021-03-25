import { Injectable, OnDestroy } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  from,
  fromEventPattern,
  merge,
  NEVER,
  MonoTypeOperatorFunction,
  of,
  forkJoin,
  ReplaySubject
} from 'rxjs';
import {
  mergeMap,
  filter,
  switchMap,
  scan,
  take,
  toArray,
  withLatestFrom,
  debounceTime,
  startWith,
  map
} from 'rxjs/operators';

import { LayerSource } from '@tamu-gisc/common/types';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

@Injectable()
export class LayerListService implements OnDestroy {
  private _store: BehaviorSubject<LayerListItem<esri.Layer>[]> = new BehaviorSubject([]);

  private _scale: BehaviorSubject<number> = new BehaviorSubject(undefined);
  private _scaleThrottled: Observable<number>;

  private _handles: esri.Handles;

  private _model: esri.LayerListViewModel;

  public allLayers: Observable<Array<esri.ListItem>>;

  constructor(
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService,
    private environment: EnvironmentService
  ) {
    const LayerSources = this.environment.value('LayerSources');
    this._scaleThrottled = this._scale.asObservable().pipe(debounceTime(250));

    forkJoin([from(this.moduleProvider.require(['Handles', 'LayerListViewModel'])), this.mapService.store]).subscribe(
      ([[HandlesConstructor, LayerListViewModel], instance]: [
        [esri.HandlesConstructor, esri.LayerListViewModelConstructor],
        MapServiceInstance
      ]) => {
        this._model = new LayerListViewModel({
          view: instance.view
        });

        let handle: esri.Handle;

        const add = (handler) => {
          handle = this._model.operationalItems.watch('length', handler);
        };

        /**
         * Destroys a property watch handler for a layer by handleKey if it exists.
         *
         * Function executed whenever the source observable is unsubscribed from.
         *
         */
        const remove = (handler): void => {
          handle.remove();
        };

        // For every item, attempt to create a layer
        this.allLayers = fromEventPattern(add, remove).pipe(
          startWith(-1),
          map(() => this._model.operationalItems.toArray())
        );

        this._handles = new HandlesConstructor();
        // Perform a check against the map instance to add existing layers. Layers added after this
        // point will be handled by the change event.

        // Create a LayerListItem instance for each including the existing layer instance as a class property.
        const existing: LayerListItem<esri.Layer>[] = instance.map.allLayers
          .filter((l) => {
            // Undefined value means "default" value, which is equal to "show"
            return l.listMode === undefined || l.listMode === 'show';
          })
          .toArray()
          .map((l) => {
            return new LayerListItem({ layer: l });
          });

        // Determine layers in layer sources that are listed as show, but are being marked as lazy loaded.
        // Create a LayerListItem instance for each, leaving the layer property undefined.
        // This will be used as a flag to determine whether a layer needs to be lazy-loaded
        const nonExisting: LayerListItem<esri.Layer>[] = LayerSources.filter((s) => {
          return (s.listMode === undefined || s.listMode === 'show') && existing.findIndex((el) => s.id === el.id) === -1;
        }).map((l) => {
          return new LayerListItem(l);
        });

        // Concatenate the existing (true layer instances) and non existing layers (layer references to be lazy-loaded)
        this._store.next([...existing, ...nonExisting]);

        // Event handler that listens for layer changes in the map instance
        instance.map.allLayers.on('change', (e) => {
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
              .filter(
                (al) =>
                  (al.listMode === undefined || al.listMode === 'show') &&
                  this._store.value.findIndex((cl) => cl.id === al.id) === -1
              )
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

        instance.view.watch('scale', (scale) => {
          this._scale.next(scale);
        });
      }
    );
  }

  public ngOnDestroy() {
    // Clean up all layer handle references.
    this._handles.removeAll();
  }

  public layers() {
    return forkJoin([from(this.moduleProvider.require(['LayerListViewModel'])), this.mapService.store]).pipe(
      switchMap(([[LayerListViewModel], instance]: [[esri.LayerListViewModelConstructor], MapServiceInstance]) => {
        this._model = new LayerListViewModel({
          view: instance.view
        });

        let handle: esri.Handle;

        const add = (handler) => {
          handle = this._model.operationalItems.watch('length', handler);
        };

        const remove = (handler): void => {
          handle.remove();
        };

        // For every item, attempt to create a layer
        return fromEventPattern(add, remove).pipe(
          startWith(-1),
          map(() => this._model.operationalItems.toArray())
        );
      })
    );
  }
}

export class LayerListItem<T extends esri.Layer> {
  public id: LayerSource['id'];
  public title: LayerSource['title'];
  public layer: T;
  public category: LayerSource['category'];
  public outsideExtent = false;

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
   * Layer ID or ID's that will be returned with the subscription.
   *
   * Will default to return all layers.
   */
  layers?: string | string[];

  /**
   * List of layer properties that trigger a state emission.
   */
  watchProperties?: string | string[];
}
