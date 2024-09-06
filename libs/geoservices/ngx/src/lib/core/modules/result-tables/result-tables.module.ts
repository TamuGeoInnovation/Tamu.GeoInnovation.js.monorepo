import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { StatusResultTableComponent } from './components/common/status-result-table/status-result-table.component';
import { CensusIntersectionResultTabsComponent } from './components/census-intersection/census-intersection-result-tabs/census-intersection-result-tabs.component';
import { GeocodeResultTableComponent } from './components/geocoding/geocode-result-table/geocode-result-table.component';
import { GeocodeInputParametersComponent } from './components/geocoding/geocode-input-parameters/geocode-input-parameters.component';
import { ParsedAddressResultTableComponent } from './components/address-processing/parsed-address-result-table/parsed-address-result-table.component';
import { GeocodeMatchedReferenceFeatureTableComponent } from './components/geocoding/geocode-matched-reference-feature-table/geocode-matched-reference-feature-table.component';
import { CensusIntersectionResultTableComponent } from './components/census-intersection/census-intersection-result-table/census-intersection-result-table.component';
import { ReverseGeocodingResultTableComponent } from './components/reverse-geocoding/reverse-geocoding-result-table/reverse-geocoding-result-table.component';

@NgModule({
  imports: [CommonModule, UILayoutModule],
  declarations: [
    StatusResultTableComponent,
    CensusIntersectionResultTabsComponent,
    GeocodeResultTableComponent,
    GeocodeInputParametersComponent,
    ParsedAddressResultTableComponent,
    GeocodeMatchedReferenceFeatureTableComponent,
    CensusIntersectionResultTableComponent,
    ReverseGeocodingResultTableComponent
  ],
  exports: [
    StatusResultTableComponent,
    CensusIntersectionResultTabsComponent,
    GeocodeResultTableComponent,
    GeocodeInputParametersComponent,
    ParsedAddressResultTableComponent,
    GeocodeMatchedReferenceFeatureTableComponent,
    CensusIntersectionResultTableComponent,
    ReverseGeocodingResultTableComponent
  ]
})
export class ResultTablesModule {}
