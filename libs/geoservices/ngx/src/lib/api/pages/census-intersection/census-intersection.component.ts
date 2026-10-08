import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CensusIntersection, CensusYear } from '@tamu-gisc/geoprocessing-v5';
import { ServiceAttributeAccordionComponent } from '../../components/fragments/common/service-attribute-accordion/service-attribute-accordion.component';
import { CensusYearsParameterFragmentComponent } from '../../components/fragments/common/census-years-parameter-fragment/census-years-parameter-fragment.component';
import { ScrollToDirective } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { ApiVersionFragmentComponent } from '../../components/fragments/common/api-version-fragment/api-version-fragment.component';
import { QueryStatusFragmentComponent } from '../../components/fragments/common/query-status-fragment/query-status-fragment.component';
import { CensusRecordFragmentComponent } from '../../components/fragments/common/census-record-fragment/census-record-fragment.component';

@Component({
  selector: 'tamu-gisc-census-intersection',
  templateUrl: './census-intersection.component.html',
  styleUrls: ['./census-intersection.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ServiceAttributeAccordionComponent,
    CensusYearsParameterFragmentComponent,
    ScrollToDirective,
    ApiVersionFragmentComponent,
    QueryStatusFragmentComponent,
    CensusRecordFragmentComponent
  ]
})
export class CensusIntersectionComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/censusintersection/v5  ';

  public apiKey = 'demo';

  public runner: CensusIntersection = new CensusIntersection({
    apiKey: this.apiKey,
    lat: 34.0726207994348,
    lon: 118.397965182076,
    s: 'CA',
    censusYears: CensusYear.AllAvailable
  });
}
