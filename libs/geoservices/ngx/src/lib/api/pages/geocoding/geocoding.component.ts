import { Component } from '@angular/core';

import { Geocoder } from '@tamu-gisc/common/utils/geometry/geoprocessing';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent {
  public apiVersion = '5.0';
  public url = 'https://prod.geoservices.tamu.edu/Api/Geocode/V5/';

  public apiKey = 'demo';

  public runner: Geocoder = new Geocoder({
    apiKey: this.apiKey,
    version: '4.01',
    streetAddress: '9355 Burton Way',
    city: 'Beverly Hills',
    state: 'ca',
    zip: 90210,
    includeHeader: true,
    census: true,
    censusYear: 'allAvailable',
    verbose: true
  });
}
