import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { ReverseGeocode } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-reverse-geocoding',
  templateUrl: './reverse-geocoding.component.html',
  styleUrls: ['./reverse-geocoding.component.scss']
})
export class ReverseGeocodingComponent implements OnInit {
  private geocoder: ReverseGeocode;
  public result: Observable<string>;

  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.geocoder = new ReverseGeocode({
      apiKey: 'demo',
      latitude: 30.610487,
      longitude: -96.327766,
      serviceHost: this.env.value('geoprocessing_api_host_override')
    });

    this.result = this.geocoder.asObservable().pipe(
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
