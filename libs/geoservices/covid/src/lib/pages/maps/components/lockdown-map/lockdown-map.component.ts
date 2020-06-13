import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';

@Component({
  selector: 'tamu-gisc-lockdown-map',
  templateUrl: './lockdown-map.component.html',
  styleUrls: ['./lockdown-map.component.scss']
})
export class LockdownMapComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private http: HttpClient) {}

  public unformattedData;
  public statData: Array<StatRecord>;
  public lockdownButtonToggle = false;
  public infoBoxModel: BehaviorSubject<IInfoBox> = new BehaviorSubject(undefined);

  public ngOnInit(): void {
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
            'fill-outline-color': '#FFFFFF'
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
      map.on('mousemove', 'counties', (e) => {
        const feature = e.features[0];
        const selectedCounty = this.statData.filter((county) => county.fips === feature.properties.fips);

        this.infoBoxModel.next({
          name: feature.properties.NAME,
          fips: selectedCounty[0]['fips'],
          claims: selectedCounty[0]['claims'],
          sites: selectedCounty[0]['sites'],
          lockdowns: selectedCounty[0]['lockdowns']
        });
      });

      map.on('click', 'counties', (e) => {
        const feature = e.features[0];
        const selectedCounty = this.statData.filter((county) => county.fips === feature.properties.fips);
        this.getFipsLockdownData(selectedCounty[0]['fips']);
      });
    });
  }

  public getFipsLockdownData(fipsCode: string) {
    console.log(fipsCode);
    const lockdownUrl = 'https://nodes.geoservices.tamu.edu/api/covid/lockdowns/active/county/' + fipsCode;
    const requests = forkJoin([this.http.get(lockdownUrl)]);
    requests.pipe(take(1)).subscribe(([lockdownData]) => {
      console.log(lockdownData);
      return lockdownData;
    });
  }

  public getStats(): void {
    const statsUrl = 'https://nodes.geoservices.tamu.edu/api/covid/counties/stats';
    const requests = forkJoin([this.http.get(statsUrl)]);
    requests.pipe(take(1)).subscribe(([recievedData]) => {
      this.unformattedData = recievedData;
      this.formatData();
      this.drawMap();
    });
  }
  public formatData(): void {
    console.log(this.unformattedData);
    this.statData = new Array();
    Object.keys(this.unformattedData).forEach((keyIndex) => {
      const statToAdd: StatRecord = {
        fips: keyIndex,
        claims: this.unformattedData[keyIndex]['claims'],
        sites: this.unformattedData[keyIndex]['sites'],
        lockdowns: this.unformattedData[keyIndex]['lockdowns']
      };
      this.statData.push(statToAdd);
    });
  }

  public drawMap(): void {
    const key = this.lockdownButtonToggle === true ? 'lockdowns' : 'claims';
    const colorSchemes = this.lockdownButtonToggle === true ? ['#FC8D59', '#ECE7F2'] : ['#2B8CBE', '#ECE7F2'];
    const countyExpression = ['match', ['get', 'fips']];
    this.statData.forEach((row) => {
      const number = row[key];
      const color = number > 0 ? colorSchemes[0] : colorSchemes[1];
      countyExpression.push(row['fips'], color);
    });
    countyExpression.push('rgba(255,255,255,1)');
    this.mapService.map.setPaintProperty('counties', 'fill-color', countyExpression);
  }

  public lockdownToggle() {
    this.lockdownButtonToggle = !this.lockdownButtonToggle;
    this.drawMap();
  }
}

interface StatRecord {
  fips: string;
  claims: number;
  sites: number;
  lockdowns: number;
}
interface IInfoBox extends StatRecord {
  name: string;
}
