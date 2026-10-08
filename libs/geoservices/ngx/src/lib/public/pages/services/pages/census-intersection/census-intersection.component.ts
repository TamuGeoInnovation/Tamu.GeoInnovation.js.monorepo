import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { CensusIntersection, CensusYear } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CensusIntersectionBasicComponent } from '../../../../../core/modules/interactive/components/census-intersection/basic/census-intersection-basic/census-intersection-basic.component';
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
    selector: 'tamu-gisc-census-intersection',
    templateUrl: './census-intersection.component.html',
    styleUrls: ['./census-intersection.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CensusIntersectionBasicComponent, TabsComponent, TabComponent, CodeRunnerComponent, RouterLink, StepperComponent, StepComponent, StepperToggleDirective, AsyncPipe, HighlightPlusModule]
})
export class CensusIntersectionComponent implements OnInit {
  private intersection: CensusIntersection;
  public result: Observable<string>;

  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.intersection = new CensusIntersection({
      apiKey: 'demo',
      lat: 34.0726207996348,
      lon: -118.397965182076,
      s: 'CA',
      censusYears: CensusYear.AllAvailable,
      serviceHost: this.env.value('geoprocessing_api_host_override')
    });

    this.result = this.intersection.asObservable().pipe(
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
