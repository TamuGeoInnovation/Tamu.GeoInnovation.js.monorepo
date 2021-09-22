import { Component, OnInit } from '@angular/core';

import { forkJoin, Observable } from 'rxjs';
import { count, shareReplay } from 'rxjs/operators';

import { MapConfig, EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse } from '../../types/types';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-kissingbugs-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  public config: MapConfig = {
    basemap: {
      basemap: 'dark-gray-vector'
    },
    view: {
      mode: '2d',
      properties: {
        center: [-99.20987760767717, 31.225356084754477],
        zoom: 6,
        highlightOptions: {
          haloColor: '#500000',
          color: 'gray',
          fillOpacity: 0.5
        }
      }
    }
  };

  public map: esri.Map;
  public view: esri.MapView;

  public activeBug = '0';
  public activeMonth = 0;
  public currentCounty: {
    name: string;
    count: number;
  } = {
    name: 'Kissing bugs by county',
    count: 0
  };
  public bins = [200, 200, 150, 100, 50, 0];

  private bugLayerId = 'bugs';

  public pageContents: Observable<IStrapiPageResponse>;

  constructor(private ss: StrapiService, private mapService: EsriMapService, private mp: EsriModuleProviderService) {}

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('map', language).pipe(shareReplay(1));

    this.mapService.store.subscribe((instances) => {
      this.map = instances.map;
      this.view = instances.view as esri.MapView;

      this.view.on('mouse-wheel', (evt) => {
        // prevents zooming with the mouse-wheel event
        evt.stopPropagation();
      });

      this.getNewDataset();
    });

    this.mp.require(['Expand']).then(([Expand]: [esri.ExpandConstructor]) => {
      const bugSelector = document.getElementById('bug-selector');

      const bugSelectorExpand = new Expand({
        collapseIconClass: 'esri-icon-close-circled',
        expandIconClass: 'esri-icon-filter',
        expandTooltip: 'Bug selection',
        view: this.view,
        expanded: false,
        content: bugSelector
      });

      this.view.ui.add(bugSelectorExpand, 'top-left');

      const monthSelector = document.getElementById('month-selector');

      const monthSelectorExpand = new Expand({
        collapseIconClass: 'esri-icon-close-circled',
        expandIconClass: 'esri-icon-time-clock',
        expandTooltip: 'Month selection',
        view: this.view,
        expanded: false,
        content: monthSelector
      });

      this.view.ui.add(monthSelectorExpand, 'top-left');

      const currentCounty = document.getElementById('currentCounty');
      this.view.ui.add(currentCounty, 'top-right');

      const legend = document.getElementById('legend');

      this.view.ui.add(legend, 'bottom-right');
    });
  }

  public getNewDataset() {
    this.mp
      .require(['FeatureLayer', 'Graphic', 'Symbol', 'Geometry', 'Polygon', 'GraphicsLayer', 'Field'])
      .then(
        ([FeatureLayer, Graphic, Symbol, Geometry, Polygon, GraphicsLayer, Field]: [
          esri.FeatureLayerConstructor,
          esri.GraphicConstructor,
          esri.SymbolConstructor,
          esri.GeometryConstructor,
          esri.PolygonConstructor,
          esri.GraphicsLayerConstructor,
          esri.FieldConstructor
        ]) => {
          const template = {
            title: '{NAME} - {FIPS}',
            content: 'Cases: {Count}'
          };

          const countyData = this.ss.getCountyLayer();
          const bugData = this.ss.getBugData2(this.activeBug, this.activeMonth);
          // const bugData = this.ss.getBugData();
          console.log(`?speciesGuid=${this.activeBug}&month=${this.activeMonth}`);

          const featureLayer = this.map.findLayerById(this.bugLayerId) as esri.FeatureLayer;
          if (featureLayer) {
            this.map.remove(featureLayer);
          }

          forkJoin([countyData, bugData]).subscribe((observer) => {
            const countyLayer = observer[0];
            const bugCounts = observer[1];

            const featureData = countyLayer.features.map((feature) => {
              const found = bugCounts.find((element) => {
                return element.FIPS === feature.properties['FIPS'];
              });

              if (found) {
                feature.properties['Count'] = found.Count;
              }

              return feature;
            });

            const clientsideGraphics = featureData.map((feature) => {
              const geom = new Polygon();
              feature.geometry.coordinates.forEach((coord) => {
                if (feature.geometry.type === 'MultiPolygon') {
                  geom.addRing(coord[0]);
                } else if (feature.geometry.type === 'Polygon') {
                  geom.addRing(coord);
                }
              });

              return {
                geometry: geom,
                attributes: feature.properties
              };
            });

            const layer = new FeatureLayer({
              id: this.bugLayerId,
              title: 'Confirmed kissing bug encounters',

              source: clientsideGraphics,
              objectIdField: 'GEO_ID',
              fields: [
                new Field({
                  name: 'GEO_ID',
                  alias: 'geo_id',
                  type: 'string'
                }),
                new Field({
                  name: 'NAME',
                  alias: 'Name',
                  type: 'string'
                }),
                new Field({
                  name: 'CENSUSAREA',
                  alias: 'Area',
                  type: 'double'
                }),
                new Field({
                  name: 'FIPS',
                  alias: 'FIPS',
                  type: 'string'
                }),
                new Field({
                  name: 'Count',
                  alias: 'Count',
                  type: 'integer'
                })
              ],
              outFields: ['*'],
              renderer: this.getRenderer(),
              popupTemplate: template
            });

            this.map.add(layer);

            this.view.whenLayerView(layer).then((layerView) => {
              let highlight;

              this.view.on('pointer-move', (event) => {
                this.view.hitTest(event).then((response) => {
                  if (response.results.length) {
                    const graphics = response.results.filter((result) => {
                      return result.graphic.layer.id === this.bugLayerId;
                    });

                    if (graphics.length > 0) {
                      const graphic = graphics[0].graphic as esri.Graphic;

                      if (highlight) {
                        highlight.remove();
                      }

                      highlight = layerView.highlight(graphic);

                      this.currentCounty = {
                        name: graphic.attributes['NAME'],
                        count: graphic.attributes['Count']
                      };
                    }
                  }
                });
              });
            });
          });
        }
      );
  }

  public setBug(bug) {
    this.activeBug = bug;

    this.setBins();
    this.updateLegend();

    this.getNewDataset();
  }

  public setMonth(month: number) {
    this.activeMonth = month;

    this.getNewDataset();
    // Update dataset
  }

  public updateLegend() {
    this.view.layerViews.map((layerView) => {
      console.log(layerView);
      if (layerView.layer.type === 'geojson') {
        layerView.layer.set('renderer', this.getRenderer());
      }
    });
  }

  public getRenderer() {
    const colors = ['#993404', '#d95f0e', '#fe9929', '#fed98e', '#ffffd4'];

    const bins = this.bins.map((value, index) => {
      if (value === this.bins[index + 1]) {
        return {
          minValue: value,
          maxValue: 1000,
          symbol: {
            type: 'simple-fill',
            color: colors[index]
          },
          label: `${value}+`
        };
      } else {
        return {
          maxValue: value,
          minValue: this.bins[index + 1],
          symbol: {
            type: 'simple-fill',
            color: colors[index]
          },
          label: `${this.bins[index + 1]} - ${value}`
        };
      }
    });

    // Removes the dumb undefined - 0 bin that gets created
    bins.pop();

    const renderer = ({
      type: 'class-breaks',
      field: 'Count',
      defaultSymbol: { type: 'simple-fill' },
      classBreakInfos: bins
    } as unknown) as esri.ClassBreaksRenderer;

    return renderer;
  }

  public setBins() {
    switch (this.activeBug) {
      case 'a':
        this.bins = [200, 200, 150, 100, 50, 1];
        break;

      case 'g':
        this.bins = [200, 200, 150, 100, 50, 1];
        break;

      case 'i':
        this.bins = [8, 8, 6, 4, 2, 1];
        break;

      case 'l':
        this.bins = [4, 4, 3, 2, 1, 1];
        break;

      case 's':
        this.bins = [20, 20, 15, 10, 5, 1];
        break;

      default:
        this.bins = [5, 4, 3, 2, 1];
        break;
    }
  }
}
