import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { forkJoin, from, take } from 'rxjs';

import { EsriMapService, EsriModuleProviderService, MapConfig, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-correction-lite-map',
  templateUrl: './correction-lite-map.component.html',
  styleUrls: ['./correction-lite-map.component.scss']
})
export class CorrectionLiteMapComponent implements OnInit, OnChanges {
  /**
   * This will limit when featureless clicks are emitted. If there is a row selected, then the application should
   * allow feature editing.
   */
  @Input()
  public focusedFeature: Record<string, unknown>;

  @Output()
  public featureLessClick: EventEmitter<{ lat: number; lon: number }> = new EventEmitter();

  public config: MapConfig;

  private _focusedFeatureLayerId = 'geocoded-original';
  private _correctionPointLayerId = 'correction-point';

  constructor(private readonly ms: EsriMapService, private readonly mp: EsriModuleProviderService) {}

  public ngOnInit(): void {
    this.config = {
      basemap: {
        basemap: 'streets-navigation-vector'
      },
      view: {
        mode: '2d',
        properties: {
          zoom: 4,
          center: [-98.5795, 39.8283],
          ui: {
            components: ['attribution', 'zoom']
          }
        }
      }
    };

    forkJoin([from(this.mp.require(['BasemapToggle'])), this.ms.store.pipe(take(1))]).subscribe(
      ([[BasemapToggle], instances]: [[esri.BasemapToggleConstructor], MapServiceInstance]) => {
        const toggle = new BasemapToggle({
          view: instances.view,
          nextBasemap: 'satellite'
        });

        instances.view.ui.add(toggle, 'bottom-right');
      }
    );

    this.ms.store.pipe(take(1)).subscribe((instance) => {
      instance.view.on('click', async (e) => {
        if (this.focusedFeature) {
          this.featureLessClick.emit({ lat: e.mapPoint.latitude, lon: e.mapPoint.longitude });

          const layer = (await this.ms.findLayerOrCreateFromSource({
            type: 'graphics',
            id: this._correctionPointLayerId,
            title: 'Correction Point'
          })) as esri.GraphicsLayer;

          if (layer.graphics.length > 0) {
            layer.removeAll();
          }

          layer.add({
            geometry: {
              type: 'point',
              x: e.mapPoint.longitude,
              y: e.mapPoint.latitude
            } as esri.geometryPoint,
            symbol: {
              type: 'simple-marker',
              style: 'circle',
              color: '#00C853',
              size: 10,
              outline: {
                color: '#000000',
                width: 1
              }
            } as esri.SimpleMarkerSymbolProperties
          } as unknown as esri.Graphic);
        }
      });
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.focusedFeature && changes.focusedFeature.currentValue) {
      const row = changes.focusedFeature.currentValue;

      this.createOrUpdateOriginalFeatureLayer(row);
      this._clearCorrectionPointLayer();
    }
  }

  public async createOrUpdateOriginalFeatureLayer(feature?: Record<string, unknown>) {
    const layer = (await this.ms.findLayerOrCreateFromSource({
      type: 'graphics',
      id: this._focusedFeatureLayerId,
      title: 'Geocoded Original'
    })) as esri.GraphicsLayer;

    if (layer.graphics.length > 0) {
      layer.removeAll();
    }

    layer.add({
      geometry: {
        type: 'point',
        x: feature['Longitude'],
        y: feature['Latitude']
      } as esri.geometryPoint,
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: 'red',
        size: 10,
        outline: {
          color: '#000000',
          width: 1
        }
      } as esri.SimpleMarkerSymbolProperties
    } as unknown as esri.Graphic);

    this.ms.zoomTo({
      graphics: [...layer.graphics],
      zoom: 15
    });
  }

  private async _clearCorrectionPointLayer() {
    const layer = this.ms.findLayerById(this._correctionPointLayerId) as esri.GraphicsLayer;

    if (layer) {
      layer.removeAll();
    }
  }
}
