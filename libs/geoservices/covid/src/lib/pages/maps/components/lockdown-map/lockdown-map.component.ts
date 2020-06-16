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
          id: 'counties-lockdowns',
          type: 'fill',
          source: 'county-lines',
          layout: {
            // make layer visible by default (change to none or visible for debugging)
            visibility: 'none'
          },
          'source-layer': 'county-lines',
          paint: {
            'fill-outline-color': '#303030'
          }
        },
        'road-motorway-trunk'
      );

      map.addLayer(
        {
          id: 'counties-claims',
          type: 'fill',
          source: 'county-lines',
          'source-layer': 'county-lines',
          paint: {
            'fill-outline-color': '#FFFFFF'
          }
        },
        'counties-lockdowns'
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
      map.on('mousemove', 'counties-lockdowns', (e) => {
        const feature = e.features[0];
        const selectedCounty = this.statData.filter((county) => county.fips === feature.properties.fips);
        //console.log(selectedCounty[0]['lockdownInfo']);

        this.infoBoxModel.next({
          name: feature.properties.NAME,
          fips: selectedCounty[0]['fips'],
          claims: selectedCounty[0]['claims'],
          sites: selectedCounty[0]['sites'],
          lockdowns: selectedCounty[0]['lockdowns'],
          lockdownInfo: selectedCounty[0]['lockdownInfo']
        });
      });

      map.on('click', 'counties-lockdowns', (e) => {
        const feature = e.features[0];
        const selectedCounty = this.statData.filter((county) => county.fips === feature.properties.fips);
        this.getFipsLockdownData(selectedCounty[0]['fips']);
      });
    });
  }

  public getFipsLockdownData(fipsCode: string) {
    const lockdownUrl = 'https://nodes.geoservices.tamu.edu/api/covid/lockdowns/active/county/' + fipsCode;
    const requests = forkJoin([this.http.get(lockdownUrl)]);
    requests.pipe(take(1)).subscribe(([lockdownData]) => {
      console.log(lockdownData);
      return lockdownData;
    });
  }

  public getStats(): void {
    const statsUrl = 'https://nodes.geoservices.tamu.edu/api/covid/counties/stats';
    //const statsUrl = 'http://localhost:27023/counties/stats';
    const requests = forkJoin([this.http.get(statsUrl)]);
    requests.pipe(take(1)).subscribe(([recievedData]) => {
      this.unformattedData = recievedData;
      this.formatData();
      this.drawClaimsMap();
      this.drawLockdownMap();
    });
  }

  public formatData(): void {
    this.statData = new Array();
    let lockdownRecords = new Array();
    Object.keys(this.unformattedData).forEach((keyIndex) => {
      lockdownRecords = this.unformattedData[keyIndex]['lockdownInfo'].filter((item) => {
        return item !== null;
      });
      lockdownRecords = lockdownRecords.map((item) => {
        const lockdownStat: LockdownRecord = {
          updated: item.updated,
          created: item.created,
          guid: item.guid
        };
        return lockdownStat;
      });

      const statToAdd: StatRecord = {
        fips: keyIndex,
        claims: this.unformattedData[keyIndex]['claims'],
        sites: this.unformattedData[keyIndex]['sites'],
        lockdowns: this.unformattedData[keyIndex]['lockdowns'],
        lockdownInfo: lockdownRecords
      };
      this.statData.push(statToAdd);
    });
  }

  public getDateCode(records: Array<LockdownRecord>): number {
    let minDate: LockdownRecord = null;
    let colorCode = 0;
    if (records.length === 0) {
      colorCode = 0;
      return colorCode;
    } else if (records.length > 0) {
      minDate = records.reduce((a, b) => {
        return a.updated < b.updated ? a : b;
      });
    }
    if (minDate === null) {
      colorCode = 0;
    } else {
      const timeStamp = new Date(minDate.updated).getTime();
      const stopOne = new Date().getTime() - 10 * 24 * 60 * 60 * 1000;
      const stopTwo = new Date().getTime() - 20 * 24 * 60 * 60 * 1000;
      const stopThree = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
      const stopFour = new Date().getTime() - 40 * 24 * 60 * 60 * 1000;
      const stopFive = new Date().getTime() - 50 * 24 * 60 * 60 * 1000;
      const stopSix = new Date().getTime() - 60 * 24 * 60 * 60 * 1000;
      colorCode =
        timeStamp < stopSix
          ? 7
          : timeStamp < stopFive
          ? 6
          : timeStamp < stopFour
          ? 5
          : timeStamp < stopThree
          ? 4
          : timeStamp < stopTwo
          ? 3
          : timeStamp < stopOne
          ? 2
          : 1;
    }
    return colorCode;
  }

  public drawClaimsMap(): void {
    const colorSchemes = ['#2B8CBE', '#ECE7F2'];
    const countyExpression = ['match', ['get', 'fips']];
    this.statData.forEach((row) => {
      const number = row['claims'];
      const color = number > 0 ? colorSchemes[0] : colorSchemes[1];
      countyExpression.push(row['fips'], color);
    });
    countyExpression.push('rgba(255,255,255,1)');
    this.mapService.map.setPaintProperty('counties-claims', 'fill-color', countyExpression);
  }

  public drawLockdownMap(): void {
    const colorSchemes = ['#4d4d4d', '#4575b4', '#91bfdb', '#e0f3f8', '#ffffbf', '#fee090', '#fc8d59', '#d73027'];
    const countyExpression = ['match', ['get', 'fips']];
    this.statData.forEach((row) => {
      const number = this.getDateCode(row.lockdownInfo);
      const color = colorSchemes[number];
      countyExpression.push(row['fips'], color);
    });
    countyExpression.push('rgba(255,255,255,1)');
    this.mapService.map.setPaintProperty('counties-lockdowns', 'fill-color', countyExpression);
  }

  public lockdownToggle() {
    this.lockdownButtonToggle = !this.lockdownButtonToggle;
    this.lockdownButtonToggle
      ? this.mapService.map.setLayoutProperty('counties-lockdowns', 'visibility', 'visible')
      : this.mapService.map.setLayoutProperty('counties-lockdowns', 'visibility', 'none');
  }
}

interface StatRecord {
  fips: string;
  claims: number;
  sites: number;
  lockdowns: number;
  lockdownInfo: Array<LockdownRecord>;
}

interface LockdownRecord {
  updated: Date;
  created: Date;
  guid: string;
}

interface IInfoBox extends StatRecord {
  name: string;
}
