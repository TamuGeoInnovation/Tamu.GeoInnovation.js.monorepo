import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ReverseGeocodingBasicComponent } from './components/reverse-geocoding/basic/reverse-geocoding-basic/reverse-geocoding-basic.component';
import { CensusIntersectionBasicComponent } from './components/census-intersection/basic/census-intersection-basic/census-intersection-basic.component';
import { AddressProcessingBasicComponent } from './components/address-processing/basic/address-processing-basic/address-processing-basic.component';
import { GeocodingBasicComponent } from './components/geocoding/basic/geocoding-basic/geocoding-basic.component';
import { InteractiveResponseMetadataComponent } from './components/common/interactive-response-metadata/interactive-response-metadata.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, EsriMapModule],
  declarations: [
    ReverseGeocodingBasicComponent,
    CensusIntersectionBasicComponent,
    AddressProcessingBasicComponent,
    GeocodingBasicComponent,
    InteractiveResponseMetadataComponent
  ],
  exports: [
    ReverseGeocodingBasicComponent,
    CensusIntersectionBasicComponent,
    AddressProcessingBasicComponent,
    GeocodingBasicComponent
  ]
})
export class GeoservicesCoreInteractiveModule {}
