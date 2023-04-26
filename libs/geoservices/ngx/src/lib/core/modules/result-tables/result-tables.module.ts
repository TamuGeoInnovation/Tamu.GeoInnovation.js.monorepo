import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { StatusResultTableComponent } from './components/common/status-result-table/status-result-table.component';
import { CensusIntersectionResultTabsComponent } from './components/census-intersection/census-intersection-result-tabs/census-intersection-result-tabs.component';
import { GeocodeResultTableComponent } from './components/geocoding/geocode-result-table/geocode-result-table.component';
import { GeocodeInputParametersComponent } from './components/geocoding/geocode-input-parameters/geocode-input-parameters.component';

@NgModule({
  imports: [CommonModule, UILayoutModule],
  declarations: [
    StatusResultTableComponent,
    CensusIntersectionResultTabsComponent,
    GeocodeResultTableComponent,
    GeocodeInputParametersComponent
  ],
  exports: [
    StatusResultTableComponent,
    CensusIntersectionResultTabsComponent,
    GeocodeResultTableComponent,
    GeocodeInputParametersComponent
  ]
})
export class ResultTablesModule {}

