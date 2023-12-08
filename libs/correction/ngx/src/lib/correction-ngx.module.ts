import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { CorrectionLiteMapComponent } from './components/correction-lite-map/correction-lite-map.component';
import { CorrectionDataTableComponent } from './components/correction-data-table/correction-data-table.component';

@NgModule({
  imports: [CommonModule, EsriMapModule, UIFormsModule],
  declarations: [CorrectionLiteMapComponent, CorrectionDataTableComponent],
  exports: [CorrectionLiteMapComponent, CorrectionDataTableComponent]
})
export class CorrectionNgxModule {}
