import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { ReverseGeocode } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ReverseGeocodingBasicComponent } from '../../../../../core/modules/interactive/components/reverse-geocoding/basic/reverse-geocoding-basic/reverse-geocoding-basic.component';
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
    selector: 'tamu-gisc-reverse-geocoding',
    templateUrl: './reverse-geocoding.component.html',
    styleUrls: ['./reverse-geocoding.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReverseGeocodingBasicComponent, TabsComponent, TabComponent, CodeRunnerComponent, RouterLink, StepperComponent, StepComponent, StepperToggleDirective, AsyncPipe, HighlightPlusModule]
})
export class ReverseGeocodingComponent implements OnInit {
  private geocoder: ReverseGeocode;
  public result: Observable<string>;

  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.geocoder = new ReverseGeocode({
      apiKey: 'demo',
      latitude: 30.610487,
      longitude: -96.327766,
      serviceHost: this.env.value('geoprocessing_api_host_override')
    });

    this.result = this.geocoder.asObservable().pipe(
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
