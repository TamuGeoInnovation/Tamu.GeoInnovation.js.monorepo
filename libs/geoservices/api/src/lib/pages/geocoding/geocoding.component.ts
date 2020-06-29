import { Component, OnInit } from '@angular/core';

import { Geocoder, IGeocoderOptions, ApiBase } from '@tamu-gisc/common/utils/geometry/geoprocessing';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  // public apiVersion = '5.0';
  // public url = 'https://geoservices.tamu.edu/api/geocode/v5';

  public apiVersion: '4.01' = '4.01';
  public url =
    'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsedAdvanced_V04_01.aspx';

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

  constructor() {}

  public ngOnInit() {}
}
