import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Geocode, CensusYear, GeocodeReferenceFeature } from '@tamu-gisc/geoprocessing-v5';
import { ServiceAttributeAccordionComponent } from '../../components/fragments/common/service-attribute-accordion/service-attribute-accordion.component';
import { CensusYearsParameterFragmentComponent } from '../../components/fragments/common/census-years-parameter-fragment/census-years-parameter-fragment.component';
import { ApiVersionFragmentComponent } from '../../components/fragments/common/api-version-fragment/api-version-fragment.component';
import { QueryStatusFragmentComponent } from '../../components/fragments/common/query-status-fragment/query-status-fragment.component';
import { AccordionDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AddressMatchTypeAttributeListComponent } from '../../components/fragments/common/address-match-type-attribute-list/address-match-type-attribute-list.component';
import { CensusRecordFragmentComponent } from '../../components/fragments/common/census-record-fragment/census-record-fragment.component';
import { AddressAttributeListComponent } from '../../components/fragments/common/address-attribute-list/address-attribute-list.component';
import { ReferenceFeatureAttributeListComponent } from '../../components/fragments/common/reference-feature-attribute-list/reference-feature-attribute-list.component';

@Component({
    selector: 'tamu-gisc-geocoding',
    templateUrl: './geocoding.component.html',
    styleUrls: ['./geocoding.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ServiceAttributeAccordionComponent, CensusYearsParameterFragmentComponent, ApiVersionFragmentComponent, QueryStatusFragmentComponent, AccordionDirective, AccordionHeaderDirective, AccordionContentDirective, AddressMatchTypeAttributeListComponent, CensusRecordFragmentComponent, AddressAttributeListComponent, ReferenceFeatureAttributeListComponent]
})
export class GeocodingComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/geocode/v5';

  public apiKey = 'demo';

  public runner: Geocode = new Geocode({
    apiKey: this.apiKey,
    streetAddress: '1207 Winding Road',
    city: 'College Station',
    state: 'tx',
    zip: 77840,
    census: true,
    censusYears: CensusYear.AllAvailable,
    refs: [GeocodeReferenceFeature.MicrosoftFootprints]
  });
}
