import { Component, OnInit } from '@angular/core';

import { forkJoin, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

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
        zoom: 6
      }
    }
  };

  public map: esri.Map;
  public view: esri.MapView;

  public activeBug = 'a';
  public bins = [200, 200, 150, 100, 50, 0];

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

      this.view.on('pointer-move', (event) => {
        // Search for graphics on layers at the hovered location
        this.view.hitTest(event).then((response) => {
          // if graphics are returned, do something with results
          if (response.results.length) {
            // do something
            // console.log('This was found: ', response);
          }
        });
      });
    });

    this.mp
      .require(['Slider', 'Expand', 'GeoJSONLayer', 'FeatureLayer', 'Graphic', 'Symbol', 'Geometry', 'Polygon'])
      .then(
        ([Slider, Expand, GeoJSONLayer, FeatureLayer, Graphic, Symbol, Geometry, Polygon]: [
          esri.SliderConstructor,
          esri.ExpandConstructor,
          esri.GeoJSONLayerConstructor,
          esri.FeatureLayerConstructor,
          esri.GraphicConstructor,
          esri.SymbolConstructor,
          esri.GeometryConstructor,
          esri.PolygonConstructor
        ]) => {
          const template = {
            title: '{NAME} - {FIPS}',
            content: 'Area {CENSUSAREA}'
          };

          const countyData = this.ss.getCountyLayer();
          const bugData = this.ss.getBugData();

          forkJoin([countyData, bugData]).subscribe((observer) => {
            // console.log('forkJoin', observer);
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

            const graphics = featureData.map((feature) => {
              return {
                geometry: new Polygon({
                  rings: feature.geometry.coordinates
                }),
                attributes: feature.properties
              };
            });

            const layer = new FeatureLayer({
              title: 'Confirmed kissing bugs',
              source: graphics,
              objectIdField: 'FIPS',
              fields: [
                {
                  name: 'NAME',
                  alias: 'Name',
                  type: 'string'
                },
                {
                  name: 'CENSUSAREA',
                  alias: 'Area',
                  type: 'double'
                },
                {
                  name: 'FIPS',
                  alias: 'FIPS',
                  type: 'string'
                },
                {
                  name: 'Count',
                  alias: 'Count',
                  type: 'integer'
                }
              ],
              renderer: this.getRenderer(),
              popupTemplate: template
            });

            this.map.add(layer);
          });

          // const geojsonLayer = new GeoJSONLayer({
          //   url: 'http://localhost:1337/uploads/counties20m_696b17e926.json',
          //   title: 'Confirmed kissing bugs',
          //   legendEnabled: true,
          //   renderer: this.getRenderer(),
          //   fields: [
          //     {
          //       name: 'NAME',
          //       alias: 'Name',
          //       type: 'string'
          //     },
          //     {
          //       name: 'CENSUSAREA',
          //       alias: 'Area',
          //       type: 'double'
          //     },
          //     {
          //       name: 'FIPS',
          //       alias: 'FIPS',
          //       type: 'string'
          //     },
          //     {
          //       name: 'Count',
          //       alias: 'Count',
          //       type: 'integer'
          //     }
          //   ],
          //   popupTemplate: template
          // });
          // this.map.add(geojsonLayer);

          // console.log(this.map.layers);

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

          const legend = document.getElementById('legend');

          this.view.ui.add(legend, 'top-right');

          // const slider = new Slider({
          //   container: 'timeSlider',
          //   min: 1,
          //   max: 12,
          //   values: [1],
          //   steps: 1,
          //   visibleElements: {
          //     labels: true,
          //     rangeLabels: true
          //   }
          // });

          // slider.on('thumb-drag', this.newMonthSelected);

          // this.view.ui.add(slider, 'bottom-left');
        }
      );
  }

  public setBug(bug) {
    this.activeBug = bug;

    this.setBins();
    this.updateLegend();
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
        this.bins = [200, 200, 150, 100, 50, 0];
        break;

      case 'g':
        this.bins = [200, 200, 150, 100, 50, 0];
        break;

      case 'i':
        this.bins = [8, 8, 6, 4, 2, 0];
        break;

      case 'l':
        this.bins = [4, 4, 3, 2, 1, 0];
        break;

      case 's':
        this.bins = [20, 20, 15, 10, 5, 0];
        break;

      default:
        this.bins = [5, 4, 3, 2, 1];
        break;
    }
  }
}
