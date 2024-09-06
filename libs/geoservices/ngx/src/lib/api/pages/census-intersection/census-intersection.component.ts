import { Component } from '@angular/core';

import { CensusIntersection, CensusYear } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-census-intersection',
  templateUrl: './census-intersection.component.html',
  styleUrls: ['./census-intersection.component.scss']
})
export class CensusIntersectionComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/censusintersection/v5  ';

  public apiKey = 'demo';

  public runner: CensusIntersection = new CensusIntersection({
    apiKey: this.apiKey,
    lat: 34.0726207994348,
    lon: 118.397965182076,
    s: 'CA',
    censusYears: CensusYear.AllAvailable
  });
}
