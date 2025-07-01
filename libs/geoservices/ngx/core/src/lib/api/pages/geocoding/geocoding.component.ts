import { Component } from '@angular/core';
import { Geocode, CensusYear, GeocodeReferenceFeature } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/geocode/v5';

  public apiKey = 'demo';

  public runner: Geocode = new Geocode({
    apiKey: this.apiKey,
    streetAddress: '1207 Winding Road',
    city: 'College Station',
    state: 'tx',
    zip: 77840,
    census: true,
    censusYears: CensusYear.AllAvailable,
    refs: [GeocodeReferenceFeature.MicrosoftFootprints]
  });
}
