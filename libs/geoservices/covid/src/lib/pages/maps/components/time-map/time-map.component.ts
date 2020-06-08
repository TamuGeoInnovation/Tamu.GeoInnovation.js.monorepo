import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Moment } from 'moment';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { View } from 'typeorm/schema-builder/view/View';

interface StateRecord {
  STATE: string;
  pop: number;
  cases: number;
  deaths: number;
  infectionRate: number;
  deathRate: number;
}

interface CountyRecord {
  fips: string;
  pop: number;
  cases: number;
  deaths: number;
  infectionRate: number;
  deathRate: number;
}

interface IInfoBox {
  name: string;
  pop: number;
  cases: number;
  deaths: number;
  infectionRate: number;
  deathRate: number;
}

@Component({
  selector: 'tamu-gisc-time-map',
  templateUrl: './time-map.component.html',
  styleUrls: ['./time-map.component.scss']
})
export class TimeMapComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private http: HttpClient) {}

  private maxDate: string;
  private selectedDate: string;
  private stateData: Array<StateRecord>;
  private countyData: Array<CountyRecord>;

  public infoBoxModel: BehaviorSubject<IInfoBox> = new BehaviorSubject(undefined);
  public mortalButtonToggled = false;
  public stateButtonToggle = false;

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
          id: 'covid-state',
          type: 'fill',
          source: 'state-lines',
          'source-layer': 'state-lines',
          layout: {
            // make layer visible by default (change to none or visible for debugging)
            visibility: 'none'
          }
        },
        'road-minor-low'
      );

      map.addLayer(
        {
          id: 'covid-county',
          type: 'fill',
          source: 'county-lines',
          'source-layer': 'county-lines',
          paint: {
            'fill-outline-color': '#ffffff'
          }
        },
        'covid-state'
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

      map.on('mousemove', 'covid-county', (e) => {
        const feature = e.features[0];
        const selectedCounty = this.countyData.filter((county) => county.fips === feature.properties.fips);

        this.infoBoxModel.next({
          name: feature.properties.NAME,
          pop: feature.properties.POPESTIMATE2019,
          cases: selectedCounty[0]['confirmed'],
          infectionRate: selectedCounty[0]['infection_rate'],
          deaths: selectedCounty[0]['deaths'],
          deathRate: selectedCounty[0]['death_rate']
        });
      });

      map.on('mousemove', 'covid-state', (e) => {
        const feature = e.features[0];
        const selectedState = this.stateData.filter((state) => state.STATE === feature.properties.STATE);

        this.infoBoxModel.next({
          name: feature.properties.NAME,
          pop: feature.properties.POPESTIMATE2019,
          cases: selectedState[0]['confirmed'],
          infectionRate: selectedState[0]['infection_rate'],
          deaths: selectedState[0]['deaths'],
          deathRate: selectedState[0]['death_rate']
        });
      });
      this.reloadData();
    });
  }

  public reloadData() {
    const currentDateSelected = '2020-06-06';
    console.log(currentDateSelected);
    const stateURL =
      'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/states/' +
      currentDateSelected +
      '.json';
    const countyURL =
      'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/counties/' +
      currentDateSelected +
      '.json';

    const requests = forkJoin([this.http.get(stateURL), this.http.get(countyURL)]);
    requests.pipe(take(1)).subscribe(([sData, cData]) => {
      this.stateData = sData[currentDateSelected];
      this.countyData = cData[currentDateSelected];
      this.selectedDate = currentDateSelected;
      this.mortalButtonToggled ? this.drawDeathMap() : this.drawCasesMap();
    });
  }

  public drawCasesMap() {
    const stateExpression = ['match', ['get', 'STATE']];
    const countyExpression = ['match', ['get', 'fips']];

    this.stateData.forEach(function(row) {
      const number = row['infection_rate'];
      const color =
        number > 1000
          ? '#AE8080'
          : number > 500
          ? '#D18080'
          : number > 100
          ? '#FC8B8B'
          : number > 10
          ? '#FDC4C4'
          : number > 1
          ? '#FDE6E6'
          : '#FFFFFF';
      stateExpression.push(row['STATE'], color);
    });

    this.countyData.forEach(function(row) {
      const number = row['infection_rate'];
      const color =
        number > 1000
          ? '#AE8080'
          : number > 500
          ? '#D18080'
          : number > 100
          ? '#FC8B8B'
          : number > 10
          ? '#FDC4C4'
          : number > 1
          ? '#FDE6E6'
          : '#FFFFFF';
      countyExpression.push(row['fips'], color);
    });

    stateExpression.push('rgba(255,255,255,1)');
    countyExpression.push('rgba(255,255,255,1)');

    this.mapService.map.setPaintProperty('covid-state', 'fill-color', stateExpression);
    this.mapService.map.setPaintProperty('covid-county', 'fill-color', countyExpression);
  }

  public drawDeathMap() {
    const stateExpression = ['match', ['get', 'STATE']];
    const countyExpression = ['match', ['get', 'fips']];

    this.stateData.forEach(function(row) {
      const number = row['death_rate'];
      const color =
        number > 100
          ? '#54278F'
          : number > 75
          ? '#756BB1'
          : number > 50
          ? '#9E9AC8'
          : number > 10
          ? '#BCBDDC'
          : number > 1
          ? '#DADAEB'
          : '#F2F0F7';
      stateExpression.push(row['STATE'], color);
    });

    this.countyData.forEach(function(row) {
      const number = row['death_rate'];
      const color =
        number > 100
          ? '#54278F'
          : number > 75
          ? '#756BB1'
          : number > 50
          ? '#9E9AC8'
          : number > 10
          ? '#BCBDDC'
          : number > 1
          ? '#DADAEB'
          : '#F2F0F7';
      countyExpression.push(row['fips'], color);
    });

    stateExpression.push('rgba(255,255,255,1)');
    countyExpression.push('rgba(255,255,255,1)');

    this.mapService.map.setPaintProperty('covid-state', 'fill-color', stateExpression);
    this.mapService.map.setPaintProperty('covid-county', 'fill-color', countyExpression);
  }

  public stateToggle() {
    this.stateButtonToggle = !this.stateButtonToggle;
    this.switchLayers();
  }

  public mortalityToggle() {
    this.mortalButtonToggled = !this.mortalButtonToggled;
    this.mortalButtonToggled ? this.drawDeathMap() : this.drawCasesMap();
  }

  public switchLayers() {
    this.stateButtonToggle
      ? this.mapService.map.setLayoutProperty('covid-state', 'visibility', 'visible')
      : this.mapService.map.setLayoutProperty('covid-state', 'visibility', 'none');
  }
}
