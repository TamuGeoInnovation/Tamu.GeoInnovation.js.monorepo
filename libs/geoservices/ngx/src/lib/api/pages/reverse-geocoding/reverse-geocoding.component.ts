import { Component } from '@angular/core';

import { ReverseGeocode } from '@tamu-gisc/geoprocessing/v5';

@Component({
  selector: 'tamu-gisc-reverse-geocoding',
  templateUrl: './reverse-geocoding.component.html',
  styleUrls: ['./reverse-geocoding.component.scss']
})
export class ReverseGeocodingComponent {
  public apiVersion = '5.0';
  public url = 'https://prod.geoservices.tamu.edu/api/reversegeocoding/v5';

  public apiKey = 'demo';

  public runner: ReverseGeocode = new ReverseGeocode({
    apiKey: this.apiKey,
    latitude: 30.610487,
    longitude: -96.327766
  });
}
