import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';

@Component({
  selector: 'tamu-gisc-time-map',
  templateUrl: './time-map.component.html',
  styleUrls: ['./time-map.component.scss']
})
export class TimeMapComponent implements OnInit {
  constructor(private mapService: MapboxMapService, private http: HttpClient) {}

  private stateData: Array<StateRecord>;
  private countyData: Array<CountyRecord>;
  public infoBoxModel: BehaviorSubject<IInfoBox> = new BehaviorSubject(undefined);
  public dateModel: BehaviorSubject<String> = new BehaviorSubject(undefined);

  public dateSelected: string;
  public currentDay: number = new Date().getTime();

  public mortalButtonToggled = false;
  public stateButtonToggle = false;

  @ViewChild('datePicker', { static: false })
  public datePicker: ElementRef;

  public ngOnInit(): void {
    this.mapService.loaded.pipe(take(1)).subscribe((map) => {
      const maxDate: Date = new Date(this.currentDay - 1 * 24 * 60 * 60 * 1000);
      this.dateSelected = maxDate.toISOString().split('T')[0];
      this.datePicker.nativeElement.value = this.dateSelected;
      this.datePicker.nativeElement.max = this.dateSelected;
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
        const [feature] = e.features;
        const props = feature.properties as County;
        const selectedCounty = this.countyData.filter((county) => county.fips === props.fips);
        this.infoBoxModel.next({
          name: props.NAME,
          population: selectedCounty[0].population,
          confirmed: selectedCounty[0].confirmed,
          infection_rate: selectedCounty[0].infection_rate,
          deaths: selectedCounty[0].deaths,
          death_rate: selectedCounty[0].death_rate
        });
      });

      map.on('mousemove', 'covid-state', (e) => {
        const [feature] = e.features;
        const props = feature.properties as State;
        const selectedState = this.stateData.filter((state) => state.STATE === props.STATE);
        this.infoBoxModel.next({
          name: feature.properties.NAME,
          population: selectedState[0].population,
          confirmed: selectedState[0].confirmed,
          infection_rate: selectedState[0].infection_rate,
          deaths: selectedState[0].deaths,
          death_rate: selectedState[0].death_rate
        });
      });

      map.on('mouseleave', 'covid-county', (e) => {
        this.infoBoxModel.next(null);
      });

      map.on('mouseleave', 'covid-state', (e) => {
        this.infoBoxModel.next(null);
      });

      map.dragRotate.disable();

      this.reloadData();
    });
  }

  public reloadData(): void {
    this.dateSelected = this.datePicker.nativeElement.value;
    const stateURL = `https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/states/${this.dateSelected}.json`;
    const countyURL = `https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/counties/${this.dateSelected}.json`;
    this.dateModel.next(this.dateSelected);

    const requests = forkJoin([this.http.get(stateURL), this.http.get(countyURL)]);
    requests.subscribe(([sData, cData]) => {
      this.stateData = sData[this.dateSelected] as Array<StateRecord>;
      this.countyData = cData[this.dateSelected] as Array<CountyRecord>;
      this.mortalButtonToggled ? this.drawDeathMap() : this.drawCasesMap();
    });
  }

  public drawCasesMap(): void {
    const stateExpression = ['match', ['get', 'STATE']];
    const countyExpression = ['match', ['get', 'fips']];

    this.stateData.map((row) => {
      const number = row.infection_rate;
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
      stateExpression.push(row.STATE, color);
    });

    this.countyData.map((row) => {
      const number = row.infection_rate;
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
          : '#FFF7EC';
      countyExpression.push(row.fips, color);
    });

    stateExpression.push('rgba(255,255,255,1)');
    countyExpression.push('rgba(255,255,255,1)');

    this.mapService.map.setPaintProperty('covid-state', 'fill-color', stateExpression);
    this.mapService.map.setPaintProperty('covid-county', 'fill-color', countyExpression);
  }

  public drawDeathMap(): void {
    const stateExpression = ['match', ['get', 'STATE']];
    const countyExpression = ['match', ['get', 'fips']];

    this.stateData.map((row) => {
      const number = row.death_rate;
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
      stateExpression.push(row.STATE, color);
    });

    this.countyData.map((row) => {
      const number = row.death_rate;
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
      countyExpression.push(row.fips, color);
    });

    stateExpression.push('rgba(255,255,255,1)');
    countyExpression.push('rgba(255,255,255,1)');

    this.mapService.map.setPaintProperty('covid-state', 'fill-color', stateExpression);
    this.mapService.map.setPaintProperty('covid-county', 'fill-color', countyExpression);
  }

  public stateToggle(): void {
    this.stateButtonToggle = !this.stateButtonToggle;
    this.switchLayers();
  }

  public mortalityToggle(): void {
    this.mortalButtonToggled = !this.mortalButtonToggled;
    this.mortalButtonToggled ? this.drawDeathMap() : this.drawCasesMap();
  }

  public switchLayers(): void {
    this.stateButtonToggle
      ? this.mapService.map.setLayoutProperty('covid-state', 'visibility', 'visible')
      : this.mapService.map.setLayoutProperty('covid-state', 'visibility', 'none');
  }
}

interface BaseRecord {
  population: number;
  confirmed: number;
  deaths: number;
  infection_rate: number;
  death_rate: number;
}

interface StateRecord extends BaseRecord {
  STATE: string;
}

interface CountyRecord extends BaseRecord {
  fips: string;
}

interface IInfoBox extends BaseRecord {
  name: string;
}

interface State {
  STATE: string;
  NAME: string;
}

interface County {
  fips: string;
  NAME: string;
}
