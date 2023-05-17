import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, pipe, map, switchMap, withLatestFrom } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { AddressProcessing, AddressProcessingResult, IAddressProcessingOptions } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

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
    private readonly ls: LocalStoreService,
    private readonly as: AuthService
  ) {
    super(fb, rt, ar, ls, as);
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
      withLatestFrom(this.as.apiKey),
      switchMap(([, apiKey]) => {
        const params = { ...this.getQueryParameters(), apiKey };

        return new AddressProcessing(params).asObservable();
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
      apiKey: '',
      addressFormat: typeof form.addressFormat === 'string' ? [form.addressFormat] : [...form.addressFormat]
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
