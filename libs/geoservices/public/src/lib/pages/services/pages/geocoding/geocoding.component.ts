import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Geocoder } from '@tamu-gisc/common/utils/geometry/geoprocessing';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  private geocode: Geocoder;
  public result: Observable<string>;

  constructor() {
    this.geocode = new Geocoder({
      apiKey: 'demo',
      version: '4.01',
      streetAddress: '9355 Burton Way',
      city: 'Beverly Hills',
      state: 'ca',
      zip: 99210
    });
  }

  public ngOnInit() {}

  public execute() {
    this.result = this.geocode.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
