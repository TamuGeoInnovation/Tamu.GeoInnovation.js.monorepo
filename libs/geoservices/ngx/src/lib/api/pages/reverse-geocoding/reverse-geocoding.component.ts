import { Component } from '@angular/core';

import { ReverseGeocoder } from '@tamu-gisc/common/utils/geometry/geoprocessing';

@Component({
  selector: 'tamu-gisc-reverse-geocoding',
  templateUrl: './reverse-geocoding.component.html',
  styleUrls: ['./reverse-geocoding.component.scss']
})
export class ReverseGeocodingComponent {
  public apiVersion = '5.0';
  public url = 'https://prod.geoservices.tamu.edu/api/reversegeocoding/v5';

  public apiKey = 'demo';

  public runner: ReverseGeocoder = new ReverseGeocoder({
    apiKey: this.apiKey,
    lat: 34.0726207994348,
    lon: 118.397965182076,
    version: '4.10',
    state: 'ca',
    notStore: false
  });
}
