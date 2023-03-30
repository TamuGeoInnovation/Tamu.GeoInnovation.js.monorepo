import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ReverseGeocodingBasicComponent } from './components/reverse-geocoding/basic/reverse-geocoding-basic/reverse-geocoding-basic.component';
import { CensusIntersectionBasicComponent } from './components/census-intersection/basic/census-intersection-basic/census-intersection-basic.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, EsriMapModule],
  declarations: [ReverseGeocodingBasicComponent, CensusIntersectionBasicComponent],
  exports: [ReverseGeocodingBasicComponent, CensusIntersectionBasicComponent]
})
export class GeoservicesCoreInteractiveModule {}
