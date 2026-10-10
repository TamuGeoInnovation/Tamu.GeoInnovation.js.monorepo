import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { Geocode, CensusYear, GeocodeReferenceFeature } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { GeocodingBasicComponent } from '../../../../../core/modules/interactive/components/geocoding/basic/geocoding-basic/geocoding-basic.component';
import { TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TabComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { CodeRunnerComponent } from '@tamu-gisc/ui-kits/ngx/layout/code';
import { RouterLink } from '@angular/router';
import { StepperComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { StepComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { StepperToggleDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AsyncPipe } from '@angular/common';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    GeocodingBasicComponent,
    TabsComponent,
    TabComponent,
    CodeRunnerComponent,
    RouterLink,
    StepperComponent,
    StepComponent,
    StepperToggleDirective,
    AsyncPipe,
    HighlightPlusModule
  ]
})
export class GeocodingComponent implements OnInit {
  private readonly env = inject(EnvironmentService);

  private geocode: Geocode;
  public result: Observable<string>;

  public url: string;

  public ngOnInit(): void {
    this.geocode = new Geocode({
      apiKey: 'demo',
      streetAddress: '1207 Winding Road',
      city: 'College Station',
      state: 'TX',
      zip: 77840,
      census: true,
      censusYears: CensusYear.AllAvailable,
      refs: [GeocodeReferenceFeature.MicrosoftFootprints],
      serviceHost: this.env.value('geoprocessing_api_host_override')
    });

    this.result = this.geocode.asObservable().pipe(
      switchMap((r) => {
        return of(JSON.stringify(r, null, '   '));
      }),
      catchError((err) => {
        return of(err.toRenderableJSON(true));
      })
    );

    this.url = this.env.value('accounts_url') + '/UserServices/Databases/Upload/Step1.aspx';
  }
}
