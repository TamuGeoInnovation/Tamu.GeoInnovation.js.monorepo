import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { ReverseGeocode } from '@tamu-gisc/geoprocessing/v5';

@Component({
  selector: 'tamu-gisc-reverse-geocoding',
  templateUrl: './reverse-geocoding.component.html',
  styleUrls: ['./reverse-geocoding.component.scss']
})
export class ReverseGeocodingComponent implements OnInit {
  private geocoder: ReverseGeocode;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.geocoder = new ReverseGeocode({
      apiKey: 'demo',
      latitude: 30.610487,
      longitude: -96.327766
    });

    this.result = this.geocoder.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
