import { Injectable } from '@angular/core';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { Observable, BehaviorSubject } from 'rxjs';

import { LayerSources } from '../../../../environments/environment';

import { LayerSource } from '@tamu-gisc/common/types';
import esri = __esri;

@Injectable()
export class LayerListService {
  private _store: BehaviorSubject<LayerListItem[]> = new BehaviorSubject([]);
  public store: Observable<LayerListItem[]> = this._store.asObservable();

  constructor(private mapService: EsriMapService) {
    mapService.store.subscribe((res) => {
      // Perform a check against the map instance to add existing layers. Layers added after this
      // point will be handled by the change event.

      // Create a LayerListItem instance for each including the existing layer instance as a class property.
      const existing = res.map.allLayers
        .filter((l) => {
          return l.listMode === 'show';
        })
        .toArray()
        .map((l) => {
          return new LayerListItem({ layer: l });
        });

      // Determine layers in layer sources that are listed as show, but are being makred as lazy loaded.
      // Create a LayerListItem instance for each, leavint the layer property undefined.
      // This will be used as a flag to determine whether a layer needs to be lazy-loaded
      const nonExisting = LayerSources.filter((s) => {
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
          // previous events, so some processing must be don to ensure all layers added are either added
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
