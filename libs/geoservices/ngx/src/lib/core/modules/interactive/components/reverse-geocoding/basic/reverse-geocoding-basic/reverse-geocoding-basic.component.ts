import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, pipe } from 'rxjs';
import { map, switchMap, delay } from 'rxjs/operators';

import { IReverseGeocoderOptions, ReverseGeocode, ReverseGeocodeResult } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';

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

  constructor(private fb: FormBuilder, private rt: Router, private readonly ar: ActivatedRoute) {
    super(fb, rt, ar);
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
      switchMap(() => {
        const params = this.getQueryParameters();

        return of({
          statusCode: 200,
          message: 'Success',
          error: '',
          data: {
            version: {
              major: 5,
              minor: 0,
              build: 0,
              revision: -1,
              majorRevision: -1,
              minorRevision: -1
            },
            timeTaken: 171.88160000000002,
            transactionGuid: '31405f77-a6c9-444a-82dc-22ef1eee86d7',
            apiHost: 'geoservices.tamu.edu',
            clientHost: 'geoservices.tamu.edu',
            queryStatusCode: 'Success',
            results: [
              {
                timeTaken: 0,
                exceptionOccurred: false,
                errorMessage: '',
                apn: '4342011022',
                streetAddress: '9309 Burton Way',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90209',
                zipPlus4: '3605'
              }
            ]
          }
        } as ReverseGeocodeResult).pipe(delay(1500));

        return new ReverseGeocode(params).asObservable().pipe(delay(1500));
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
      apiKey: 'demo',
      latitude: form.lat,
      longitude: form.lon,
      state: form.state || undefined
    };
  }
}
