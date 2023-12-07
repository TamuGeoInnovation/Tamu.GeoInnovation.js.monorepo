import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { CorrectionLiteMapComponent } from './components/map/correction-lite-map.component';

@NgModule({
  imports: [CommonModule, EsriMapModule],
  declarations: [CorrectionLiteMapComponent],
  exports: [CorrectionLiteMapComponent]
})
export class CorrectionNgxModule {}
