import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { Moment } from 'moment';
import { ajax, AjaxResponse } from 'rxjs/ajax'
import { forkJoin } from 'rxjs'
import { map } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-time-map',
  templateUrl: './time-map.component.html',
  styleUrls: ['./time-map.component.scss']
})
export class TimeMapComponent implements OnInit {

  constructor(private mapService: MapboxMapService, private http: HttpClient) {}

  public maxDate: string;
  public mortalButtonToggled: boolean;
  

  public ngOnInit() {
    
    this.mapService.loaded.subscribe((map) => {
      const zoomThreshold = 4;

      map.addSource('county-lines', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.countylines'
      });

      map.addSource('state-lines', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.statelines'
      });

      map.addLayer({
        'id': 'covid-state',
        'type': 'fill',
        'source': 'state-lines',
        'source-layer': 'state-lines',
        'layout': {
          // make layer visible by default (change to none or visible for debugging)
          'visibility': 'none'
          }
      }, 'road-minor-low')
    
      map.addLayer({
        'id': 'covid-county',
        'type': 'fill',
        'source': 'county-lines',
        'source-layer': 'county-lines',
        'paint': {
          'fill-outline-color': '#ffffff',
        }
      }, 'covid-state');
    
      map.addLayer({
        'id': 'statelines',
        'type': 'line',
        'source': 'state-lines',
        'source-layer': 'state-lines',
        'paint': {
          'line-color': '#000000',
          'line-width': 1
        }
      }), 'state-label';
    });
    this.mortalButtonToggled = false;
    this.reloadData(this.mortalButtonToggled);

  }


  public reloadData(mortalButtonSelected : boolean) {
    //dateToLoad = moment($("#mapdate").val()).format('YYYY-MM-DD').toString();
    //console.log('loading ' + dateToLoad);
    console.log('reloadData called')
    const currentDateSelected = '2020-05-20'
    console.log(currentDateSelected)
    const stateURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/states/' + currentDateSelected + '.json'
    const countyURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/counties/' + currentDateSelected + '.json'
    
    const requests = forkJoin([
      this.http.get(stateURL),
      this.http.get(countyURL)
    ]);
    requests.subscribe(([stateData,countyData]) => {
      mortalButtonSelected ? this.drawDeathMap(stateData, countyData, currentDateSelected) : this.drawCasesMap(stateData, countyData, currentDateSelected);
    });
  }

    
    
    /*ajax.when(
      ajax.getJSON(countyURL, function (data) {
        countyData = data;
      }),
      ajax.getJSON(stateURL, function (data) {
        stateData = data;
      })
    ).then(function (cData, sData) {
      if (cData && sData) {
        mortalButtonSelected ? drawDeathMap() : drawCasesMap();
      } else {
        alert('something went horribly wrong')
      }
    });*/


  public drawCasesMap(sData, cData, dateString) {
    console.log('draw');

    const stateExpression = ['match', ['get', 'STATE']];
    const countyExpression = ['match', ['get', 'fips']];
    
    sData[dateString].forEach(function (row) {
      const number = (row['infection_rate'])
		  const color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		stateExpression.push(row['STATE'], color);
    });

    cData[dateString].forEach(function (row) {
      const number = (row['infection_rate'])
		  const color = (number > 1000) ? "#AE8080" :
			(number > 500) ? "#D18080" :
			(number > 100) ? "#FC8B8B" :
			(number > 10) ? "#FDC4C4" :
			(number > 1) ? "#FDE6E6" :
			"#FFFFFF";
		countyExpression.push(row['fips'], color);
    });

    stateExpression.push('rgba(255,255,255,1)');
    countyExpression.push('rgba(255,255,255,1)');

    this.mapService.loaded.subscribe((map) => {
      map.setPaintProperty('covid-state', 'fill-color', stateExpression);
      map.setPaintProperty('covid-county', 'fill-color', countyExpression);
    });

    //this.mapService.map.setPaintProperty('covid-state', 'fill-color', stateExpression);
    //this.mapService.map.setPaintProperty('covid-county', 'fill-color', countyExpression);
  }

  public drawDeathMap(sData, cData, dateString) {
    console.log('death');

    const stateExpression = ['match', ['get', 'STATE']];
    const countyExpression = ['match', ['get', 'fips']];
    
    sData[dateString].forEach(function (row) {
      const number = (row['death_rate'])
      const color = (number > 100) ? "#54278f" :
			(number > 75) ? "#756bb1" :
			(number > 50) ? "#9e9ac8" :
			(number > 10) ? "#bcbddc" :
			(number > 1) ? "#dadaeb" :
			"#f2f0f7";
		stateExpression.push(row['STATE'], color);
    });

    cData[dateString].forEach(function (row) {
      const number = (row['death_rate'])
      const color = (number > 100) ? "#54278f" :
			(number > 75) ? "#756bb1" :
			(number > 50) ? "#9e9ac8" :
			(number > 10) ? "#bcbddc" :
			(number > 1) ? "#dadaeb" :
			"#f2f0f7";
		countyExpression.push(row['fips'], color);
    });

    stateExpression.push('rgba(255,255,255,1)');
    countyExpression.push('rgba(255,255,255,1)');

    this.mapService.loaded.subscribe((map) => {
      map.setPaintProperty('covid-state', 'fill-color', stateExpression);
      map.setPaintProperty('covid-county', 'fill-color', countyExpression);
    });
  }

}
  