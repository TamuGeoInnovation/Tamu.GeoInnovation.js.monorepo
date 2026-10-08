import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ReverseGeocode } from '@tamu-gisc/geoprocessing-v5';
import { ServiceAttributeAccordionComponent } from '../../components/fragments/common/service-attribute-accordion/service-attribute-accordion.component';
import { ApiVersionFragmentComponent } from '../../components/fragments/common/api-version-fragment/api-version-fragment.component';
import { QueryStatusFragmentComponent } from '../../components/fragments/common/query-status-fragment/query-status-fragment.component';

@Component({
  selector: 'tamu-gisc-reverse-geocoding',
  templateUrl: './reverse-geocoding.component.html',
  styleUrls: ['./reverse-geocoding.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ServiceAttributeAccordionComponent, ApiVersionFragmentComponent, QueryStatusFragmentComponent]
})
export class ReverseGeocodingComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/reversegeocoding/v5';

  public apiKey = 'demo';

  public runner: ReverseGeocode = new ReverseGeocode({
    apiKey: this.apiKey,
    latitude: 30.610487,
    longitude: -96.327766
  });
}
