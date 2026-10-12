import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, pipe, map, switchMap, withLatestFrom } from 'rxjs';

import {
  AddressProcessing,
  AddressProcessingAddressFormat,
  AddressProcessingResult,
  IAddressProcessingOptions
} from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { ADDRESS_FORMAT_TYPES } from '../../../../../../util/dictionaries';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { BasicSummaryBlurbComponent } from '../../../common/basic-summary-blurb/basic-summary-blurb.component';
import { TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TabComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { ParsedAddressResultTableComponent } from '../../../../../result-tables/components/address-processing/parsed-address-result-table/parsed-address-result-table.component';
import { InteractiveResponseMetadataComponent } from '../../../common/interactive-response-metadata/interactive-response-metadata.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-address-processing-basic',
  templateUrl: './address-processing-basic.component.html',
  styleUrls: ['./address-processing-basic.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    SelectComponent,
    ButtonComponent,
    BasicSummaryBlurbComponent,
    TabsComponent,
    TabComponent,
    ParsedAddressResultTableComponent,
    InteractiveResponseMetadataComponent,
    AsyncPipe
  ]
})
export class AddressProcessingBasicComponent extends BaseInteractiveGeoprocessingComponent<
  AddressProcessingResult,
  IAddressProcessingOptions
> {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly as = inject(AuthService);

  public formats = ADDRESS_FORMAT_TYPES;
  public states = STATES_TITLECASE;

  public queryUrl: Observable<string>;

  public buildForm() {
    return this.fb.group({
      address: [null, [Validators.required]],
      city: [null],
      state: [null],
      zip: [null],
      addressFormat: [AddressProcessingAddressFormat.USPSPublication28, [Validators.required]]
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

    const opts = {
      nonParsedStreetAddress: form.address,
      nonParsedStreetCity: form.city,
      nonParsedStreetState: form.state,
      nonParsedStreetZIP: form.zip,
      apiKey: '',
      addressFormat: typeof form.addressFormat === 'string' ? [form.addressFormat] : [...form.addressFormat]
    } as IAddressProcessingOptions;

    return this.patchHostOverride(opts);
  }

  public getMapPoints() {
    return pipe(
      map(() => {
        return null;
      })
    );
  }
}
