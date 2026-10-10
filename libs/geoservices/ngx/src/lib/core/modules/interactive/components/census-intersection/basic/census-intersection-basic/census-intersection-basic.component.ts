import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { pipe, withLatestFrom, map, switchMap } from 'rxjs';

import {
  CensusIntersection,
  CensusIntersectionResult,
  CensusYear,
  ICensusIntersectionOptions
} from '@tamu-gisc/geoprocessing-v5';
import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { CENSUS_YEARS } from '../../../../../../util/dictionaries';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { BasicSummaryBlurbComponent } from '../../../common/basic-summary-blurb/basic-summary-blurb.component';
import { CensusIntersectionResultTabsComponent } from '../../../../../result-tables/components/census-intersection/census-intersection-result-tabs/census-intersection-result-tabs.component';
import { InteractiveResponseMetadataComponent } from '../../../common/interactive-response-metadata/interactive-response-metadata.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-census-intersection-basic',
  templateUrl: './census-intersection-basic.component.html',
  styleUrls: ['./census-intersection-basic.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    SelectComponent,
    ButtonComponent,
    BasicSummaryBlurbComponent,
    CensusIntersectionResultTabsComponent,
    InteractiveResponseMetadataComponent,
    AsyncPipe
  ]
})
export class CensusIntersectionBasicComponent extends BaseInteractiveGeoprocessingComponent<
  CensusIntersectionResult,
  ICensusIntersectionOptions
> {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly as = inject(AuthService);

  public states = STATES_TITLECASE;
  public censusYears = CENSUS_YEARS;

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
