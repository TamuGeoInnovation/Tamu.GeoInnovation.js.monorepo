import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  public unformattedData;
  public statData: Array<StatRecord>;
  public siteButtonToggle = false;

  public ngOnInit() {
    this.mapService.loaded.subscribe((map) => {
      this.getStats();
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
      map.dragRotate.disable();
    });
  }

  public getStats() {
    const statsUrl = 'https://nodes.geoservices.tamu.edu/api/covid/counties/stats';
    const requests = forkJoin([this.http.get(statsUrl)]);
    requests.pipe(take(1)).subscribe(([recievedData]) => {
      this.unformattedData = recievedData;
      this.formatData();
      this.drawMap();
    });
  }

  public formatData() {
    console.log(this.unformattedData);
    this.statData = new Array();
    Object.keys(this.unformattedData).forEach((keyIndex) => {
      const statToAdd: StatRecord = {
        fips: keyIndex,
        claims: this.unformattedData[keyIndex]['claims'],
        sites: this.unformattedData[keyIndex]['sites']
      };
      this.statData.push(statToAdd);
    });
  }

  public drawMap() {
    const key = this.siteButtonToggle === true ? 'sites' : 'claims';
    const colorSchemes = this.siteButtonToggle === true ? ['#756bb1', '#efedf5'] : ['#2b8cbe', '#ece7f2'];
    const countyExpression = ['match', ['get', 'fips']];
    this.statData.forEach((row) => {
      const number = row[key];
      const color = number > 0 ? colorSchemes[0] : colorSchemes[1];
      countyExpression.push(row['fips'], color);
    });
    countyExpression.push('rgba(255,255,255,1)');
    this.mapService.map.setPaintProperty('counties', 'fill-color', countyExpression);
  }

  public sitesToggle() {
    this.siteButtonToggle = !this.siteButtonToggle;
    this.drawMap();
  }
}

interface StatRecord {
  fips: string;
  claims: number;
  sites: number;
}
