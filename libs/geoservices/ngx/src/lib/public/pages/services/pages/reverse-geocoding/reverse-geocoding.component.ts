import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { ReverseGeocoder } from '@tamu-gisc/geoprocessing/v4';

@Component({
  selector: 'tamu-gisc-reverse-geocoding',
  templateUrl: './reverse-geocoding.component.html',
  styleUrls: ['./reverse-geocoding.component.scss']
})
export class ReverseGeocodingComponent implements OnInit {
  private geocoder: ReverseGeocoder;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.geocoder = new ReverseGeocoder({
      apiKey: 'demo',
      lat: 30.610487,
      lon: -96.327766
    });

    this.result = this.geocoder.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
