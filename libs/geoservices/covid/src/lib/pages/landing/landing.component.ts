import { Component, OnInit } from '@angular/core';

import { MapboxMapService } from '@tamu-gisc/maps/mapbox';
import { Popup } from 'mapbox-gl';

@Component({
  selector: 'tamu-gisc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  constructor(private mapService: MapboxMapService) {}

  public ngOnInit() {
    this.mapService.loaded.subscribe((map) => {
      const zoomThreshold = 5;

      const popup = new Popup({
        closeButton: false
      });

      map.addSource('cases', {
        type: 'vector',
        url: 'mapbox://gsepulveda96.covid'
      });

      map.addLayer({
        id: 'state-cases',
        source: 'cases',
        'source-layer': 'states',
        maxzoom: zoomThreshold,
        type: 'fill',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'infection_rate'],
            0,
            '#ffffff',
            1,
            '#fde6e6',
            10,
            '#fdc4c4',
            100,
            '#fc8b8b',
            500,
            '#d18080',
            1000,
            '#ae8080'
          ],
          'fill-opacity': 0.75,
          'fill-outline-color': '#000000'
        }
      });

      map.addLayer({
        id: 'county-cases',
        source: 'cases',
        'source-layer': 'counties',
        minzoom: zoomThreshold,
        type: 'fill',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'infection_rate'],
            0,
            '#ffffff',
            1,
            '#fde6e6',
            10,
            '#fdc4c4',
            100,
            '#fc8b8b',
            500,
            '#d18080',
            1000,
            '#ae8080'
          ],
          'fill-opacity': 0.75,
          'fill-outline-color': '#000000'
        }
      });

      map.on('mousemove', 'county-cases', function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Single out the first found feature.
        const feature = e.features[0];

        // Display a popup with the name of the county
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            'County: ' +
              feature.properties.NAME +
              '</br>' +
              'Population: ' +
              feature.properties.POPESTIMATE2019 +
              '</br>' +
              'Confirmed Cases: ' +
              feature.properties.confirmed +
              '</br>' +
              'Infection Rate: ' +
              feature.properties.infection_rate.toFixed(2) +
              '/100,000 People</br>' +
              'Recovered: ' +
              feature.properties.recovered +
              '</br>' +
              'Active: ' +
              feature.properties.active +
              '</br>' +
              'Deaths: ' +
              feature.properties.deaths
          )
          .addTo(map);
      });

      map.on('mouseleave', 'county-cases', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      //states
      map.on('mousemove', 'state-cases', function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Single out the first found feature.
        const feature = e.features[0];

        // Display a popup with the name of the county
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            'State: ' +
              feature.properties.NAME +
              '</br>' +
              'Population: ' +
              feature.properties.POPESTIMATE2019 +
              '</br>' +
              'Confirmed Cases: ' +
              feature.properties.confirmed +
              '</br>' +
              'Infection Rate: ' +
              feature.properties.infection_rate.toFixed(2) +
              '/100,000 People</br>' +
              'Recovered: ' +
              feature.properties.recovered +
              '</br>' +
              'Active: ' +
              feature.properties.active +
              '</br>' +
              'Deaths: ' +
              feature.properties.deaths
          )
          .addTo(map);
      });

      map.on('mouseleave', 'state-cases', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      // const stateLegendEl = document.getElementById('state-legend');
      // const countyLegendEl = document.getElementById('county-legend');
      // map.on('zoom', function() {
      //   popup.remove();
      //   if (map.getZoom() > zoomThreshold) {
      //     stateLegendEl.style.display = 'none';
      //     countyLegendEl.style.display = 'block';
      //   } else {
      //     stateLegendEl.style.display = 'block';
      //     countyLegendEl.style.display = 'none';
      //   }
      // });
    });
  }
}
