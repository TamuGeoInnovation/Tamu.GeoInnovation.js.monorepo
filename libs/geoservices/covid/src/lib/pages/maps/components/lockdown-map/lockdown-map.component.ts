import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { CountiesService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-lockdown-map',
  templateUrl: './lockdown-map.component.html',
  styleUrls: ['./lockdown-map.component.scss']
})
export class LockdownMapComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private http: HttpClient, private countyService: CountiesService) {}
  public unformattedData: Array<DataRecord>;
  public statData: Array<StatRecord>;
  public lockdownButtonToggle = false;
  public infoBoxModel: BehaviorSubject<IInfoBox> = new BehaviorSubject(undefined);
  public countyBoxModel: BehaviorSubject<CountyStateBox> = new BehaviorSubject(undefined);
  public ngOnInit(): void {
    this.mapService.loaded.pipe(take(1)).subscribe((map) => {
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

      map.on('mousemove', 'counties-lockdowns', (e) => {
        const feature = e.features[0];
        const clickedCounty: County = {
          name: feature[0].properties.NAME,
          fips: feature[0].properties.fips
        };
        this.countyBoxModel.next({
          county: clickedCounty.name
        });
      });

      map.on('click', 'counties-lockdowns', (e) => {
        const feature = e.features[0];
        const clickedCounty: County = {
          name: feature[0].properties.NAME,
          fips: feature[0].properties.fips
        };
        const filteredCounty = this.statData.filter((county) => county.fips === clickedCounty.fips);
        const hoveredCounty = filteredCounty[0];
        const updatedDate: Date = hoveredCounty.lockdownInfo[0] ? hoveredCounty.lockdownInfo[0].updated : null;
        const createdDate: Date = hoveredCounty.lockdownInfo[0] ? hoveredCounty.lockdownInfo[0].created : null;
        this.infoBoxModel.next({
          name: clickedCounty.name,
          state: hoveredCounty.state,
          fips: hoveredCounty.fips,
          fipsNum: hoveredCounty.fipsNum,
          claims: hoveredCounty.claims,
          sites: hoveredCounty.sites,
          lockdowns: hoveredCounty.lockdowns,
          lockdownInfo: hoveredCounty.lockdownInfo,
          updated: updatedDate,
          created: createdDate
        });
      });
      map.dragRotate.disable();
    });
  }

  public getStats(): void {
    const statsUrl = 'https://nodes.geoservices.tamu.edu/api/covid/counties/stats';
    const requests = forkJoin([this.http.get<DataRecord[]>(statsUrl)]);
    requests.subscribe(([recievedData]) => {
      this.unformattedData = recievedData;
      this.formatData();
      this.drawClaimsMap();
      this.drawLockdownMap();
    });
  }

  public formatData(): void {
    this.statData = Object.entries(this.unformattedData).map(([key, entry]) => {
      return {
        fips: key,
        state: key.substring(0, 2),
        fipsNum: parseInt(key, 10),
        claims: entry.claims,
        sites: entry.sites,
        lockdowns: entry.lockdowns,
        lockdownInfo: entry.lockdownInfo
          .filter((item) => {
            return item !== null;
          })
          .map((lockRecord) => {
            return {
              updated: lockRecord.updated,
              created: lockRecord.created,
              guid: lockRecord.guid
            };
          })
      };
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
      //Left most side of the equation is days (day* hour* min * sec *msec)
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
    const colorSchemes = ['#4D4D4D', '#1A9850', '#91CF60', '#D9EF8B', '#FFFFBF', '#FEE08B', '#FC8D59', '#D73027'];
    const countyExpression = ['match', ['get', 'fips']];
    this.statData.forEach((row) => {
      const number = this.getDateCode(row.lockdownInfo);
      const color = colorSchemes[number];
      countyExpression.push(row['fips'], color);
    });
    countyExpression.push('rgba(255,255,255,1)');
    this.mapService.map.setPaintProperty('counties-lockdowns', 'fill-color', countyExpression);
  }

  public lockdownToggle(): void {
    this.lockdownButtonToggle = !this.lockdownButtonToggle;
    this.lockdownButtonToggle
      ? this.mapService.map.setLayoutProperty('counties-lockdowns', 'visibility', 'visible')
      : this.mapService.map.setLayoutProperty('counties-lockdowns', 'visibility', 'none');
  }
}

interface DataRecord {
  claims: number;
  sites: number;
  lockdowns: number;
  lockdownInfo: Array<LockdownRecord>;
}

interface StatRecord extends DataRecord {
  fips: string;
  fipsNum: number;
  state: string;
}

interface LockdownRecord {
  updated: Date;
  created: Date;
  guid: string;
}

interface IInfoBox extends StatRecord {
  name: string;
  updated: Date;
  created: Date;
}

interface CountyStateBox {
  county: string;
}

interface County {
  name: string;
  fips: string;
}
