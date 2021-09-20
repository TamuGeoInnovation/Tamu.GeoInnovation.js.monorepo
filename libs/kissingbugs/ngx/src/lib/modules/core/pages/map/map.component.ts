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
        zoom: 6
      }
    }
  };

  public map: esri.Map;
  public view: esri.MapView;

  public activeBug = 'a';
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

      this.view.on('pointer-move', (event) => {
        // Search for graphics on layers at the hovered location
        this.view.hitTest(event).then((response) => {
          // if graphics are returned, do something with results
          if (response.results.length) {
            // do something

            // const graphic = response.results.filter((result) => {
            //   // check if the graphic belongs to the layer of interest
            //   return result.graphic.layer.title === 'Confirmed kissing bugs';
            // })[0].graphic as esri.Graphic;

            const countyHits = response.results.filter((result) => result.graphic.layer.id === this.bugLayerId);

            if (countyHits.length > 0) {
              // moused over a feature in the bug count layer
              const graphic = countyHits[0].graphic;

              this.currentCounty = {
                name: graphic.attributes['NAME'],
                count: graphic.attributes['Count']
              };

              const graphicLayer = this.map.findLayerById('highlight') as esri.GraphicsLayer;

              graphicLayer.removeAll();
              graphicLayer.graphics.push(graphic);
            } else {
              (this.map.findLayerById('highlight') as esri.GraphicsLayer).removeAll();
              this.currentCounty = {
                name: 'Kissing bugs by county',
                count: 0
              };
            }

            // graphic.symbol = {
            //   type: 'simple-fill',
            //   color: ''
            // }
            // graphic.symbol.color = '#33cc33';
            // graphic.symbol = {
            //   type: "simple-fill",
            //   color: "rgba(255, 255, 255, 1)",
            //   outline: {
            //     width: 0.5,
            //     color: "darkblue"
            //   }
            // }

            // graphic.set('symbol', {
            //   type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            //   color: "blue",
            // })
            // const graphicLayer = this.map.findLayerById('highlight') as esri.GraphicsLayer;
            // graphicLayer.removeAll();
            // graphicLayer.graphics.push(graphic);
          }
        });
      });
    });

    this.mp
      .require([
        'Slider',
        'Expand',
        'GeoJSONLayer',
        'FeatureLayer',
        'Graphic',
        'Symbol',
        'Geometry',
        'Polygon',
        'GraphicsLayer',
        'Field'
      ])
      .then(
        ([Slider, Expand, GeoJSONLayer, FeatureLayer, Graphic, Symbol, Geometry, Polygon, GraphicsLayer, Field]: [
          esri.SliderConstructor,
          esri.ExpandConstructor,
          esri.GeoJSONLayerConstructor,
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
          const bugData = this.ss.getBugData();

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

            const graphics = featureData.map((feature) => {
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

              source: graphics,
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

            const graphicsLayer = new GraphicsLayer({
              id: 'highlight',
              title: 'graphicLayer',
              listMode: 'hide'
            });

            this.map.add(graphicsLayer);
          });

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

  public setMonth(month: number) {
    this.activeMonth = month;

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
