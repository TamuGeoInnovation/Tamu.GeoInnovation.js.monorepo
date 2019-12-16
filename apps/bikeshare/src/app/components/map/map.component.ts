import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;
@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  private _mapInstance: MapServiceInstance;
  private _$destroy: EventEmitter<boolean> = new EventEmitter();

  constructor(private environment: EnvironmentService, private mapService: EsriMapService) {}

  public config = {
    basemap: {
      basemap: {
        baseLayers: [
          {
            type: 'TileLayer',
            url: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/BaseMap_20190813/MapServer',
            spatialReference: {
              wkid: 102100
            },
            listMode: 'hide',
            visible: true,
            minScale: 100000,
            maxScale: 0,
            title: 'Base Map'
          }
        ],
        id: 'aggie_basemap',
        title: 'Aggie Basemap'
      }
    },
    view: {
      mode: '2d',
      properties: {
        // container: this.mapViewEl.nativeElement,
        map: undefined, // Reference to the map object created before the scene
        center: [-96.344672, 30.61306],
        spatialReference: {
          wkid: 102100
        },
        constraints: {
          minScale: 100000, // minZoom is the max you can zoom OUT into space
          maxScale: 0 // maxZoom is the max you can zoom INTO the ground
        },
        zoom: 16,
        popup: {
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: 'bottom-right'
          }
        },
        highlightOptions: {
          haloOpacity: 0,
          fillOpacity: 0
        }
      }
    }
  };

  public ngOnInit() {
    this.mapService.store.pipe(takeUntil(this._$destroy)).subscribe((res) => {
      this._mapInstance = res;

      this.handleDateChange();
    });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public handleDateChange(dates?: Date[]) {
    const [currentStart, currentEnd] = [
      dates && dates[0] ? dates[0] : new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      dates && dates[1] ? dates[1] : new Date()
    ];
    // Called from the DatePicker Component

    this.environment
      .value('LayerSources')
      .filter((source) => {
        return source.id.includes('date');
      })
      .map((source: LayerSource) => {
        source.url =
          source.url
            .split('/')
            .slice(0, 5)
            .join('/') +
          '/' +
          currentStart.getTime() +
          '/' +
          currentEnd.getTime();

        const totalDays = (currentEnd.getTime() - currentStart.getTime()) / (60 * 60 * 24 * 1000);

        // tslint:disable-next-line:no-any
        (source.native.renderer as any).maxPixelIntensity = 40 * totalDays;
        return source;
      });

    const updated: LayerSource[] = this.environment.value('LayerSources').filter((source) => {
      return source.id.includes('date');
    });

    const loadedLayers = updated
      .map((source) => {
        return this._mapInstance.map.findLayerById(source.id);
      })
      .filter((layer) => layer !== undefined);

    loadedLayers.forEach((layer) => {
      const source = updated.find((s) => s.id === layer.id);

      source.loadOnInit = true;
      source.visible = true;
    });

    const toLoad = loadedLayers.map((l) => {
      return updated.find((u) => l.id === u.id);
    });

    this._mapInstance.map.removeMany([...loadedLayers]);

    toLoad.forEach((s) => {
      this.mapService.findLayerOrCreateFromSource(s);
    });
  }
}
