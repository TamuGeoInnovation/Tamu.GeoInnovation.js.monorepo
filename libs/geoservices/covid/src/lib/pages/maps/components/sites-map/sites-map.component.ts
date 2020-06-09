import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Moment } from 'moment';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';

@Component({
  selector: 'tamu-gisc-sites-map',
  templateUrl: './sites-map.component.html',
  styleUrls: ['./sites-map.component.scss']
})
export class SitesMapComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private http: HttpClient) {}

  private statData;

  public ngOnInit() {
    this.mapService.loaded.subscribe((map) => {
      const zoomThreshold = 3;

      map.addSource('county-lines', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.countylines'
      });

      map.addSource('state-lines', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.statelines'
      });

      map.addLayer(
        {
          id: 'counties',
          type: 'fill',
          source: 'county-lines',
          'source-layer': 'county-lines',
          paint: {
            'fill-outline-color': '#ffffff'
          }
        },
        'road-motorway-trunk'
      );

      map.addLayer(
        {
          id: 'statelines',
          type: 'line',
          source: 'state-lines',
          'source-layer': 'state-lines',
          paint: {
            'line-color': '#000000',
            'line-width': 1
          }
        },
        'state-label'
      );
    });
  }

  public getStats() {
    const url = 'https://nodes.geoservices.tamu.edu/api/covid/counties/stats';
  }
}
