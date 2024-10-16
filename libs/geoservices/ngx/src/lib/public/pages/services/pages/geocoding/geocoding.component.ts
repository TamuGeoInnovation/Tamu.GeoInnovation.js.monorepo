import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { Geocode, CensusYear, GeocodeReferenceFeature } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  private geocode: Geocode;
  public result: Observable<string>;

  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.geocode = new Geocode({
      apiKey: 'demo',
      streetAddress: '1207 Winding Road',
      city: 'College Station',
      state: 'TX',
      zip: 77840,
      census: true,
      censusYears: CensusYear.AllAvailable,
      refs: [GeocodeReferenceFeature.MicrosoftFootprints],
      serviceHost: this.env.value('geoprocessing_api_host_override')
    });

    this.result = this.geocode.asObservable().pipe(
      switchMap((r) => {
        return of(JSON.stringify(r, null, '   '));
      }),
      catchError((err) => {
        return of(err.toRenderableJSON(true));
      })
    );

    this.url = this.env.value('accounts_url') + '/UserServices/Databases/Upload/Step1.aspx';
  }
}
