import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { pipe, withLatestFrom, map, switchMap } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { IReverseGeocoderOptions, ReverseGeocode, ReverseGeocodeResult } from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { AuthService } from '@tamu-gisc/geoservices/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { BasicSummaryBlurbComponent } from '../../../common/basic-summary-blurb/basic-summary-blurb.component';
import { TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TabComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { ReverseGeocodingResultTableComponent } from '../../../../../result-tables/components/reverse-geocoding/reverse-geocoding-result-table/reverse-geocoding-result-table.component';
import { ResultMapComponent } from '../../../common/result-map/result-map.component';
import { InteractiveResponseMetadataComponent } from '../../../common/interactive-response-metadata/interactive-response-metadata.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-basic',
  templateUrl: './reverse-geocoding-basic.component.html',
  styleUrls: ['./reverse-geocoding-basic.component.scss'],
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
    ReverseGeocodingResultTableComponent,
    ResultMapComponent,
    InteractiveResponseMetadataComponent,
    AsyncPipe
  ]
})
export class ReverseGeocodingBasicComponent extends BaseInteractiveGeoprocessingComponent<
  ReverseGeocodeResult,
  IReverseGeocoderOptions
> {
  private fb: UntypedFormBuilder;
  private rt: Router;
  private readonly ar: ActivatedRoute;
  private readonly ls: LocalStoreService;
  private readonly as: AuthService;
  private readonly en: EnvironmentService;

  public states = STATES_TITLECASE;

  constructor() {
    const fb = inject(UntypedFormBuilder);
    const rt = inject(Router);
    const ar = inject(ActivatedRoute);
    const ls = inject(LocalStoreService);
    const as = inject(AuthService);
    const en = inject(EnvironmentService);

    super(fb, rt, ar, ls, as, en);

    this.fb = fb;
    this.rt = rt;
    this.ar = ar;
    this.ls = ls;
    this.as = as;
    this.en = en;
  }

  public buildForm(): UntypedFormGroup {
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

    const opts = {
      apiKey: '',
      latitude: form.lat,
      longitude: form.lon,
      state: form.state || undefined
    } as IReverseGeocoderOptions;

    return this.patchHostOverride(opts);
  }
}
