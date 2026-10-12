import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { pipe, map, switchMap, withLatestFrom } from 'rxjs';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { Geocode, CensusYear, GeocodeResult, IGeocodeOptions } from '@tamu-gisc/geoprocessing-v5';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { CENSUS_YEARS } from '../../../../../../util/dictionaries';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { BasicSummaryBlurbComponent } from '../../../common/basic-summary-blurb/basic-summary-blurb.component';
import { TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TabComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { GeocodeResultTableComponent } from '../../../../../result-tables/components/geocoding/geocode-result-table/geocode-result-table.component';
import { ResultMapComponent } from '../../../common/result-map/result-map.component';
import { InteractiveResponseMetadataComponent } from '../../../common/interactive-response-metadata/interactive-response-metadata.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-geocoding-basic',
  templateUrl: './geocoding-basic.component.html',
  styleUrls: ['./geocoding-basic.component.scss'],
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
    GeocodeResultTableComponent,
    ResultMapComponent,
    InteractiveResponseMetadataComponent,
    AsyncPipe
  ]
})
export class GeocodingBasicComponent extends BaseInteractiveGeoprocessingComponent<GeocodeResult, IGeocodeOptions> {
  private fb = inject(UntypedFormBuilder);
  private readonly as = inject(AuthService);

  public states = STATES_TITLECASE;
  public censusYears = CENSUS_YEARS;

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

    const opts = {
      apiKey: '',
      streetAddress: form.streetAddress,
      city: form.city,
      state: form.state,
      zip: form.zip,
      censusYears: form.censusYears === CensusYear.AllAvailable ? CensusYear.AllAvailable : [form.censusYears]
    } as IGeocodeOptions;

    return this.patchHostOverride(opts);
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
