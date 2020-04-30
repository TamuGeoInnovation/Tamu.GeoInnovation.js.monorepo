import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapboxMapComponent } from './components/mapbox-map/mapbox-map.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MapboxMapComponent],
  exports: [MapboxMapComponent]
})
export class MapsMapboxModule {}
