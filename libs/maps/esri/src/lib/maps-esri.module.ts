import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsriMapComponent } from './components/esri-map/esri-map.component';

@NgModule({
  imports: [CommonModule, EsriMapComponent],
  providers: [],
  exports: [EsriMapComponent]
})
export class EsriMapModule {}
