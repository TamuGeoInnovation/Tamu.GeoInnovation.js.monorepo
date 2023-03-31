import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { of, pipe } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

import { CensusIntersection, CensusIntersectionResult } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';

@Component({
  selector: 'tamu-gisc-census-intersection-basic',
  templateUrl: './census-intersection-basic.component.html',
  styleUrls: ['./census-intersection-basic.component.scss']
})
export class CensusIntersectionBasicComponent extends BaseInteractiveGeoprocessingComponent<CensusIntersectionResult> {
  public states = STATES_TITLECASE;
  public censusIntersectionYears = [
    {
      name: '1990',
      value: 1990
    },
    {
      name: '2000',
      value: 2000
    },
    {
      name: '2010',
      value: 2010
    },
    {
      name: '2020',
      value: 2020
    },
    {
      name: 'All Available',
      value: 'allAvailable'
    }
  ];

  constructor(private readonly fb: FormBuilder, private readonly ms: EsriMapService) {
    super(fb, ms);
  }

  public buildForm() {
    return this.fb.group({
      lat: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      lon: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      censusYear: [null, [Validators.required]],
      state: [null]
    });
  }

  public getBaseMapConfig() {
    return pipe(
      map(() => {
        return null;
      })
    );
  }

  public getQuery() {
    return pipe(
      switchMap(() => {
        return of({
          statusCode: 200,
          message: 'Success',
          error: null,
          data: {
            version: {
              major: 5,
              minor: 0,
              build: 0,
              revision: 0,
              majorRevision: 0,
              minorRevision: 0
            },
            timeTaken: 406.8369,
            transactionGuid: '87155e2e-8e52-4e24-9171-5ccb0bfae0b4',
            apiHost: 'geoservices.tamu.edu',
            clientHost: '172.16.107.3',
            queryStatusCode: 'Success',
            results: [
              {
                censusYear: 1990,
                geoLocationId: '06037700800',
                censusBlock: null,
                censusBlockGroup: null,
                censusTract: '7008.00',
                censusPlaceFips: null,
                censusMcdFips: null,
                censusMsaFips: null,
                censusMetDivFips: null,
                censusCbsaFips: null,
                censusCbsaMicro: null,
                censusCountyFips: '037',
                censusStateFips: '06',
                exceptionOccurred: false,
                exceptionMessage: null
              },
              {
                censusYear: 2000,
                geoLocationId: '060377008004',
                censusBlock: '4021',
                censusBlockGroup: '4',
                censusTract: '7008.00',
                censusPlaceFips: '44000',
                censusMcdFips: '91750',
                censusMsaFips: '4472',
                censusMetDivFips: '31084',
                censusCbsaFips: '31100',
                censusCbsaMicro: '0',
                censusCountyFips: '037',
                censusStateFips: '06',
                exceptionOccurred: false,
                exceptionMessage: null
              },
              {
                censusYear: 2010,
                geoLocationId: '060377008011',
                censusBlock: '1023',
                censusBlockGroup: '1',
                censusTract: '7008.01',
                censusPlaceFips: '06308',
                censusMcdFips: '91750',
                censusMsaFips: '4472',
                censusMetDivFips: '31084',
                censusCbsaFips: '31100',
                censusCbsaMicro: '0',
                censusCountyFips: '037',
                censusStateFips: '06',
                exceptionOccurred: false,
                exceptionMessage: null
              },
              {
                censusYear: 2020,
                geoLocationId: '060377008012',
                censusBlock: '2008',
                censusBlockGroup: '2',
                censusTract: '7008.01',
                censusPlaceFips: '06308',
                censusMcdFips: '91750',
                censusMsaFips: '4472',
                censusMetDivFips: '31084',
                censusCbsaFips: '31080',
                censusCbsaMicro: '0',
                censusCountyFips: '037',
                censusStateFips: '06',
                exceptionOccurred: false,
                exceptionMessage: null
              }
            ]
          }
        } as CensusIntersectionResult).pipe(delay(1000));

        // const form = this.form.getRawValue();

        // return new CensusIntersection({
        //   apiKey: 'demo',
        //   lat: form.lat,
        //   lon: form.lon,
        //   censusYears: form.censusYear === 'allAvailable' ? 'allAvailable' : [form.censusYear]
        // }).asObservable();
      })
    );
  }
}

