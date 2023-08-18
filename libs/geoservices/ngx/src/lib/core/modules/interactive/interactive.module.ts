import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ResultTablesModule } from '../result-tables/result-tables.module';
import { ReverseGeocodingBasicComponent } from './components/reverse-geocoding/basic/reverse-geocoding-basic/reverse-geocoding-basic.component';
import { CensusIntersectionBasicComponent } from './components/census-intersection/basic/census-intersection-basic/census-intersection-basic.component';
import { AddressProcessingBasicComponent } from './components/address-processing/basic/address-processing-basic/address-processing-basic.component';
import { GeocodingBasicComponent } from './components/geocoding/basic/geocoding-basic/geocoding-basic.component';
import { InteractiveResponseMetadataComponent } from './components/common/interactive-response-metadata/interactive-response-metadata.component';
import { AddressProcessingAdvancedComponent } from './components/address-processing/advanced/address-processing-advanced/address-processing-advanced.component';
import { CensusIntersectionAdvancedComponent } from './components/census-intersection/advanced/census-intersection-advanced/census-intersection-advanced.component';
import { GeocodingAdvancedComponent } from './components/geocoding/advanced/geocoding-advanced/geocoding-advanced.component';
import { ReverseGeocodingAdvancedComponent } from './components/reverse-geocoding/advanced/reverse-geocoding-advanced/reverse-geocoding-advanced.component';
import { ResultMapComponent } from './components/common/result-map/result-map.component';
import { InteractiveModeToggleComponent } from './components/common/interactive-mode-toggle/interactive-mode-toggle.component';
import { BasicSummaryBlurbComponent } from './components/common/basic-summary-blurb/basic-summary-blurb.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    EsriMapModule,
    RouterModule,
    ResultTablesModule
  ],
  declarations: [
    ReverseGeocodingBasicComponent,
    CensusIntersectionBasicComponent,
    AddressProcessingBasicComponent,
    GeocodingBasicComponent,
    InteractiveResponseMetadataComponent,
    AddressProcessingAdvancedComponent,
    CensusIntersectionAdvancedComponent,
    GeocodingAdvancedComponent,
    ReverseGeocodingAdvancedComponent,
    ResultMapComponent,
    InteractiveModeToggleComponent,
    BasicSummaryBlurbComponent
  ],
  exports: [
    ReverseGeocodingBasicComponent,
    CensusIntersectionBasicComponent,
    AddressProcessingBasicComponent,
    GeocodingBasicComponent,
    AddressProcessingAdvancedComponent,
    CensusIntersectionAdvancedComponent,
    GeocodingAdvancedComponent,
    ReverseGeocodingAdvancedComponent
  ]
})
export class GeoservicesCoreInteractiveModule {}

