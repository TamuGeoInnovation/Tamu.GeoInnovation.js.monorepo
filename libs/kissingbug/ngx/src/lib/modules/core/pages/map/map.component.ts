import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { forkJoin, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { MapConfig, EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-kissingbug-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  private title = 'Interactive Map | Kissing Bugs and Chagas Disease in the U.S. | Texas A&M';

  public page: StrapiSingleTypes = 'map';

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
  public newBins: EsriMinMax[] = this.setBinsNew();

  private bugLayerId = 'bugs';

  public pageContents: Observable<IStrapiPageResponse>;

  constructor(
    private titleService: Title,
    private ss: StrapiService,
    private mapService: EsriMapService,
    private mp: EsriModuleProviderService
  ) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage(this.page, language).pipe(shareReplay(1));

    this.mapService.store.subscribe((instances) => {
      this.map = instances.map;
      this.view = instances.view as esri.MapView;

      this.view.on('mouse-wheel', (evt) => {
        // prevents zooming with the mouse-wheel event
        evt.stopPropagation();
      });

      this.getNewDataset();
    });
  }

  public ngAfterViewInit() {
    this.mp.require(['Expand']).then(([Expand]: [esri.ExpandConstructor]) => {
      // TODO: Should not use document to query for elements
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

      // TODO: Should not use document to query for elements
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

      // TODO: Should not use document to query for elements
      const currentCounty = document.getElementById('currentCounty');
      this.view.ui.add(currentCounty, 'top-right');

      // TODO: Should not use document to query for elements
      const legend = document.getElementById('legend');

      this.view.ui.add(legend, 'bottom-right');
    });
  }

  public getNewDataset() {
    this.mp
      .require(['FeatureLayer', 'Polygon', 'Field'])
      .then(
        ([FeatureLayer, Polygon, Field]: [esri.FeatureLayerConstructor, esri.PolygonConstructor, esri.FieldConstructor]) => {
          const template = {
            title: '{NAME} - {FIPS}',
            content: 'Cases: {Count}'
          };

          const countyData = this.ss.getCountyLayer().pipe(shareReplay(1));
          const bugData = this.ss.getBugData(this.activeBug, this.activeMonth);

          forkJoin([countyData, bugData]).subscribe((observer) => {
            // Remove the bug layer so we can update it. Without this section we end up adding multiple layers and it becomes a mess
            const featureLayer = this.map.findLayerById(this.bugLayerId) as esri.FeatureLayer;
            if (featureLayer) {
              this.map.remove(featureLayer);
            }
            const [countyLayer, bugCounts] = observer;

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
              renderer: this.getRendererNew(),
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

    this.getNewDataset();
  }

  public setMonth(month: number) {
    this.activeMonth = month;

    this.getNewDataset();
  }

  public getRendererNew() {
    const colors = ['#993404', '#d95f0e', '#fe9929', '#fed98e', '#ffffd4'];

    this.newBins = this.setBinsNew();

    const bins = this.newBins.map((value, index) => {
      return {
        minValue: value.min,
        maxValue: value.max,
        symbol: {
          type: 'simple-fill',
          color: colors[index]
        },
        label: `${value.min} - ${value.max}`
      };
    });

    const renderer = {
      type: 'class-breaks',
      field: 'Count',
      defaultSymbol: { type: 'simple-fill' },
      classBreakInfos: bins
    } as unknown as esri.ClassBreaksRenderer;

    return renderer;
  }

  public setBinsNew() {
    const bins: EsriMinMax[] = [];
    switch (this.activeBug) {
      case '0':
        bins.push(
          {
            min: 201,
            max: 1000
          },
          {
            min: 151,
            max: 200
          },
          {
            min: 101,
            max: 150
          },
          {
            min: 51,
            max: 100
          },
          {
            min: 1,
            max: 50
          }
        );
        break;

      case '30b7c552-8ac1-41ed-822f-88c559804fad':
        bins.push(
          {
            min: 201,
            max: 1000
          },
          {
            min: 151,
            max: 200
          },
          {
            min: 101,
            max: 150
          },
          {
            min: 51,
            max: 100
          },
          {
            min: 1,
            max: 50
          }
        );
        break;

      case 'b5d25229-ddcf-46d0-90c1-b0c9439f6b0c':
        bins.push(
          {
            min: 9,
            max: 100
          },
          {
            min: 7,
            max: 8
          },
          {
            min: 5,
            max: 6
          },
          {
            min: 3,
            max: 4
          },
          {
            min: 1,
            max: 2
          }
        );
        break;

      case 'ede7973b-a752-4397-b0a9-eede855711c7':
        bins.push(
          {
            min: 9,
            max: 50
          },
          {
            min: 7,
            max: 8
          },
          {
            min: 5,
            max: 6
          },
          {
            min: 3,
            max: 4
          },
          {
            min: 1,
            max: 2
          }
        );
        break;

      case '1ff5893f-d681-4136-9102-8416971f2f63':
        bins.push(
          {
            min: 20,
            max: 100
          },
          {
            min: 15,
            max: 20
          },
          {
            min: 11,
            max: 15
          },
          {
            min: 6,
            max: 10
          },
          {
            min: 1,
            max: 5
          }
        );
        break;

      default:
        bins.push(
          {
            min: 20,
            max: 1000
          },
          {
            min: 15,
            max: 20
          },
          {
            min: 11,
            max: 15
          },
          {
            min: 6,
            max: 10
          },
          {
            min: 1,
            max: 5
          }
        );
        break;
    }
    return bins;
  }
}

export interface EsriMinMax {
  min: number;
  max: number;
}
