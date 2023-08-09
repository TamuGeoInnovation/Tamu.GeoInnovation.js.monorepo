import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pipe, map, switchMap, withLatestFrom } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { Geocode, GeocodeCensusYear, GeocodeResult, IGeocodeOptions } from '@tamu-gisc/geoprocessing-v5';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { CENSUS_YEARS } from '../../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocoding-basic',
  templateUrl: './geocoding-basic.component.html',
  styleUrls: ['./geocoding-basic.component.scss']
})
export class GeocodingBasicComponent extends BaseInteractiveGeoprocessingComponent<GeocodeResult, IGeocodeOptions> {
  public states = STATES_TITLECASE;
  public censusYears = CENSUS_YEARS;

  constructor(
    private fb: FormBuilder,
    private readonly rt: Router,
    private readonly ar: ActivatedRoute,
    private readonly ls: LocalStoreService,
    private readonly as: AuthService
  ) {
    super(fb, rt, ar, ls, as);
  }

  public buildForm() {
    return this.fb.group({
      streetAddress: [null, []],
      city: [null, []],
      state: [null, []],
      zip: [null, []],
      censusYears: [null, []]
    });
  }

  public getQuery() {
    return pipe(
      withLatestFrom(this.as.apiKey),
      switchMap(([, apiKey]) => {
        const params = { ...this.getQueryParameters(), apiKey };

        return new Geocode(params).asObservable();
      })
    );
  }

  public override getQueryParameters(): IGeocodeOptions {
    const form = this.form.getRawValue();

    return {
      apiKey: '',
      streetAddress: form.streetAddress,
      city: form.city,
      state: form.state,
      zip: form.zip,
      censusYears: form.censusYears === GeocodeCensusYear.AllAvailable ? GeocodeCensusYear.AllAvailable : [form.censusYears]
    };
  }

  public getMapPoints() {
    return pipe(
      map((res: GeocodeResult) => {
        // points should be an array of objects with latitude and longitude properties based on res.data.results
        const points = res.data.results.map((result) => {
          return { latitude: result.latitude, longitude: result.longitude };
        });

        return points;
      })
    );
  }
}
