import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pipe, withLatestFrom, map, switchMap } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { IReverseGeocoderOptions, ReverseGeocode, ReverseGeocodeResult } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-basic',
  templateUrl: './reverse-geocoding-basic.component.html',
  styleUrls: ['./reverse-geocoding-basic.component.scss']
})
export class ReverseGeocodingBasicComponent extends BaseInteractiveGeoprocessingComponent<
  ReverseGeocodeResult,
  IReverseGeocoderOptions
> {
  public states = STATES_TITLECASE;

  constructor(
    private fb: FormBuilder,
    private rt: Router,
    private readonly ar: ActivatedRoute,
    private readonly ls: LocalStoreService,
    private readonly as: AuthService
  ) {
    super(fb, rt, ar, ls, as);
  }

  public buildForm(): FormGroup {
    return this.fb.group({
      lat: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      lon: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      state: [null]
    });
  }

  public getQuery() {
    return pipe(
      withLatestFrom(this.as.apiKey),
      switchMap(([, apiKey]) => {
        const params = { ...this.getQueryParameters(), apiKey };

        return new ReverseGeocode(params).asObservable();
      })
    );
  }

  public getMapPoints() {
    return pipe(
      map(() => {
        const form = this.form.getRawValue();

        const points = [
          {
            latitude: form.lat,
            longitude: form.lon
          }
        ];

        return points;
      })
    );
  }

  public override getQueryParameters(): IReverseGeocoderOptions {
    const form = this.form.getRawValue();

    return {
      apiKey: '',
      latitude: form.lat,
      longitude: form.lon,
      state: form.state || undefined
    };
  }
}
