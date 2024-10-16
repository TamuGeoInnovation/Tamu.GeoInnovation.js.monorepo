import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pipe, withLatestFrom, map, switchMap } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import {
  CensusIntersection,
  CensusIntersectionResult,
  CensusYear,
  ICensusIntersectionOptions
} from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { AuthService } from '@tamu-gisc/geoservices/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { CENSUS_YEARS } from '../../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-census-intersection-basic',
  templateUrl: './census-intersection-basic.component.html',
  styleUrls: ['./census-intersection-basic.component.scss']
})
export class CensusIntersectionBasicComponent extends BaseInteractiveGeoprocessingComponent<
  CensusIntersectionResult,
  ICensusIntersectionOptions
> {
  public states = STATES_TITLECASE;
  public censusYears = CENSUS_YEARS;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly ar: ActivatedRoute,
    private readonly ls: LocalStoreService,
    private readonly as: AuthService,
    private readonly en: EnvironmentService
  ) {
    super(fb, rt, ar, ls, as, en);
  }

  public buildForm() {
    return this.fb.group({
      lat: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      lon: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      censusYear: [null, [Validators.required]],
      state: [null]
    });
  }

  public getMapPoints() {
    return pipe(
      map(() => {
        return null;
      })
    );
  }

  public getQuery() {
    return pipe(
      withLatestFrom(this.as.apiKey),
      switchMap(([, apiKey]) => {
        const params = { ...this.getQueryParameters(), apiKey };

        return new CensusIntersection(params).asObservable();
      })
    );
  }

  public override getQueryParameters(): ICensusIntersectionOptions {
    const form = this.form.getRawValue();

    const opts = {
      apiKey: '',
      lat: form.lat,
      lon: form.lon,
      censusYears: form.censusYear === CensusYear.AllAvailable ? CensusYear.AllAvailable : [form.censusYear]
    } as ICensusIntersectionOptions;

    return this.patchHostOverride(opts);
  }
}
