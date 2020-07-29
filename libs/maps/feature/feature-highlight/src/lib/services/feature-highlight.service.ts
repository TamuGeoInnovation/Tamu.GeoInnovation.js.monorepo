import { Injectable, OnDestroy } from '@angular/core';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class FeatureHighlightService implements OnDestroy {
  private _store: HighlightFeatureStore = {};
  private _ms: MapServiceInstance;

  constructor(private mapService: EsriMapService) {
    this.mapService.store.subscribe((ins) => {
      // Keep a local instance of the map and view.
      // This is used to get layerView instances required to highlight things on the map.
      this._ms = ins;
    });
  }

  public async highlight(props: HighlightFeatureOptions) {
    if (props.layer) {
      // Do stuff here if a layer is provided
    } else if (props.features) {
      // Do stuff here if only features are provided
      const feature = props.features instanceof Array ? props.features[0] : (props.features as esri.Graphic);

      // Clear all highlights on all layers or only clear for the layer being provided.
      if (props.options && props.options.clearAllOthers) {
        this.clearAll();
      } else if (this._store[feature.layer.id]) {
        this._store[feature.layer.id].remove();
      }

      const layerView = (await this._ms.view.whenLayerView(feature.layer)) as esri.FeatureLayerView;

      this._store[feature.layer.id] = layerView.highlight(props.features);
    }
  }

  /**
   * Clears all active feature highlights
   */
  public clearAll() {
    if (Object.keys(this._store).length > 0) {
      Object.entries(this._store).forEach(([key, handle]) => {
        handle.remove();
      });
    }
  }

  public ngOnDestroy() {
    this.clearAll();
  }
}

export interface HighlightFeatureStore {
  [layerId: string]: esri.Handle;
}

export interface HighlightFeatureOptions {
  layer?: esri.Layer | string;
  features?: esri.Graphic | Array<esri.Graphic>;
  options?: {
    /**
     * Clears highlights on any other features, regardless of layer.
     */
    clearAllOthers?: boolean;
  };
}
