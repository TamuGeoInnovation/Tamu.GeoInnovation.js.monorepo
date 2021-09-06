import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
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

  public activeBug: string;

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

      // this.view.ui.add('div', 'bottom-left');
    });

    this.mp
      .require(['Slider', 'Expand', 'GeoJSONLayer', 'GraphicsLayer', 'Graphic', 'Symbol', 'Geometry'])
      .then(
        ([Slider, Expand, GeoJSONLayer, GraphicsLayer, Graphic]: [
          esri.SliderConstructor,
          esri.ExpandConstructor,
          esri.GeoJSONLayerConstructor,
          esri.GraphicsLayerConstructor,
          esri.GraphicConstructor
        ]) => {
          const renderer = ({
            type: 'class-breaks',
            field: 'CENSUSAREA',
            defaultSymbol: { type: 'simple-fill' },
            classBreakInfos: [
              {
                minValue: 0,
                maxValue: 500,
                symbol: {
                  type: 'simple-fill',
                  color: '#e3e3e3'
                }, // will be assigned sym1
                label: '0 to 500'
              },
              {
                minValue: 501,
                maxValue: 600,
                symbol: {
                  type: 'simple-fill',
                  color: '#d4d4d4'
                }, // will be assigned sym2
                label: '501 to 600'
              },
              {
                minValue: 6001,
                // maxValue: 500,
                symbol: {
                  type: 'simple-fill',
                  color: '#c5c5c5'
                }, // will be assigned sym2
                label: '600+'
              }
            ]
          } as unknown) as esri.ClassBreaksRenderer;

          const geojsonLayer = new GeoJSONLayer({
            url: 'http://localhost:1337/uploads/counties20m_696b17e926.json',
            legendEnabled: true,
            renderer: renderer
          });
          this.map.add(geojsonLayer);

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

          const slider = new Slider({
            container: 'timeSlider',
            min: 1,
            max: 12,
            values: [0],
            steps: 1,
            visibleElements: {
              labels: true,
              rangeLabels: true
            }
          });

          slider.on('thumb-drag', this.newMonthSelected);

          this.view.ui.add(slider, 'bottom-left');
        }
      );
  }

  public setBug(bug) {
    this.activeBug = bug;
  }

  public newMonthSelected(month) {
    console.log('month', month.value);
  }
}
