import { Component, OnInit } from '@angular/core';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { Moment } from 'moment';
import { ajax, AjaxResponse } from 'rxjs/ajax'

@Component({
  selector: 'tamu-gisc-time-map',
  templateUrl: './time-map.component.html',
  styleUrls: ['./time-map.component.scss']
})
export class TimeMapComponent implements OnInit {

  constructor(private mapService: MapboxMapService) {}

  public maxDate: string;
  public mortalButtonSelected: boolean;
  

  public ngOnInit() {
    this.mapService.loaded.subscribe((map) => {
      const zoomThreshold = 5;

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
        'source-layer': 'state-lines'
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
  }

  /*public reloadData(mortalButtonSelected : boolean) {
    //dateToLoad = moment($("#mapdate").val()).format('YYYY-MM-DD').toString();
    //console.log('loading ' + dateToLoad);
    const currentDateSelected = '2020-05-20'
    console.log(currentDateSelected)
  
    const stateURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/states/' + currentDateSelected + '.json'
    const countyURL = 'https://raw.githubusercontent.com/jorge-sepulveda/covid-time-map/master/src/pyscraper/outputFiles/counties/' + currentDateSelected + '.json'
    ajax.when(
      $.getJSON(countyURL, function (data) {
        countyData = data;
      }),
      $.getJSON(stateURL, function (data) {
        stateData = data;
      })
    ).then(function (cData, sData) {
      if (cData && sData) {
        mortalButtonSelected ? drawDeathMap() : drawCasesMap();
      } else {
        alert('something went horribly wrong')
      }
    });
  }*/

  public drawCasesMap() {

  }

}
  