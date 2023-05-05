import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, pipe } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { AddressProcessing, AddressProcessingResult, IAddressProcessingOptions } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { ADDRESS_FORMAT_TYPES } from '../../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-address-processing-basic',
  templateUrl: './address-processing-basic.component.html',
  styleUrls: ['./address-processing-basic.component.scss']
})
export class AddressProcessingBasicComponent extends BaseInteractiveGeoprocessingComponent<
  AddressProcessingResult,
  IAddressProcessingOptions
> {
  public formats = ADDRESS_FORMAT_TYPES;
  public states = STATES_TITLECASE;

  public queryUrl: Observable<string>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly ar: ActivatedRoute,
    private readonly ls: LocalStoreService
  ) {
    super(fb, rt, ar, ls);
  }

  public buildForm() {
    return this.fb.group({
      address: [null, [Validators.required]],
      city: [null],
      state: [null],
      zip: [null],
      addressFormat: [null, [Validators.required]]
    });
  }

  public getQuery() {
    return pipe(
      switchMap(() => {
        const params = this.getQueryParameters();

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
        } as AddressProcessingResult).pipe(delay(1250));

        return new AddressProcessing(params).asObservable().pipe(delay(1250));
      })
    );
  }

  public override getQueryParameters(): IAddressProcessingOptions {
    const form = this.form.getRawValue();

    return {
      nonParsedStreetAddress: form.address,
      nonParsedStreetCity: form.city,
      nonParsedStreetState: form.state,
      nonParsedStreetZIP: form.zip,
      apiKey: 'demo',
      addressFormat: typeof form.addressFormat === 'string' ? [] : [...form.addressFormat]
    };
  }

  public getMapPoints() {
    return pipe(
      map(() => {
        return null;
      })
    );
  }
}

