import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { of, pipe } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

import { AddressProcessing, AddressProcessingResult } from '@tamu-gisc/geoprocessing-v5';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';

@Component({
  selector: 'tamu-gisc-address-processing-basic',
  templateUrl: './address-processing-basic.component.html',
  styleUrls: ['./address-processing-basic.component.scss']
})
export class AddressProcessingBasicComponent extends BaseInteractiveGeoprocessingComponent<AddressProcessingResult> {
  public formats = [
    {
      name: 'USPS Publication 28',
      value: 'USPSPublication28'
    },
    {
      name: 'US Census Tiger',
      value: 'USCensusTiger'
    },
    {
      name: 'LA County',
      value: 'LACounty'
    }
  ];

  constructor(private readonly fb: FormBuilder, private readonly ms: EsriMapService) {
    super(fb, ms);
  }

  public buildForm() {
    return this.fb.group({
      address: [null, [Validators.required]],
      addressFormat: [null, [Validators.required]]
    });
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
            timeTaken: 31.249200000000002,
            transactionGuid: '110ef7cc-7452-4037-92d3-f7a5914c9e7c',
            apiHost: 'geoservices.tamu.edu',
            clientHost: 'geoservices.tamu.edu',
            queryStatusCode: 'Success',
            inputParameterSet: {
              streetAddress: '123 Old US HWY 25',
              city: 'Los Angeles',
              state: 'California',
              zip: '900890255',
              version: null,
              apiKey: null,
              dontStoreTransactionDetails: null,
              addressFormatTypes: ['USPSPublication28'],
              multiThreading: null,
              includeHeader: null,
              verbose: null,
              outputFormat: null
            },
            results: [
              {
                timeTaken: 0,
                exceptionOccurred: false,
                errorMessage: null,
                parsedAddress: {
                  addressLocationType: 'StreetAddress',
                  addressFormatType: 'USPSPublication28',
                  number: '123',
                  numberFractional: null,
                  preDirectional: null,
                  preQualifier: '',
                  preType: '',
                  preArticle: null,
                  name: 'OLD US 25',
                  postArticle: null,
                  postQualifier: null,
                  postDirectional: null,
                  suffix: null,
                  suiteType: null,
                  suiteNumber: null,
                  city: 'LOS ANGELES',
                  minorCivilDivision: null,
                  consolidatedCity: null,
                  countySubRegion: null,
                  county: null,
                  state: 'CA',
                  zip: '90089',
                  zipPlus1: null,
                  zipPlus2: null,
                  zipPlus3: null,
                  zipPlus4: '0255',
                  zipPlus5: null,
                  country: null
                }
              }
            ]
          }
        } as AddressProcessingResult).pipe(delay(1000));

        // const form = this.form.getRawValue();
        //
        // return new AddressProcessing({
        //   nonParsedStreetAddress: form.address,
        //   apiKey: 'demo',
        //   addressFormat: [form.outputFormat]
        // }).asObservable();
      })
    );
  }

  public getBaseMapConfig() {
    return pipe(
      map(() => {
        return null;
      })
    );
  }
}

