import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { ReverseGeocodingBasicComponent } from './components/reverse-geocoding/basic/reverse-geocoding-basic/reverse-geocoding-basic.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [ReverseGeocodingBasicComponent],
  exports: [ReverseGeocodingBasicComponent]
})
export class GeoservicesCoreInteractiveModule {}

