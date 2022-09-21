import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Geocode } from '@tamu-gisc/geoprocessing/v5';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  private geocode: Geocode;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.geocode = new Geocode({
      apiKey: 'demo',
      streetAddress: '1207 Winding Road',
      city: 'College Station',
      state: 'tx',
      zip: 77840,
      census: true,
      censusYears: 'allAvailable',
      refs: ['MicrosoftFootprints']
    });

    this.result = this.geocode.execute().pipe(
      switchMap((r) => {
        return of(JSON.stringify(r, null, '   '));
      })
    );
  }
}
