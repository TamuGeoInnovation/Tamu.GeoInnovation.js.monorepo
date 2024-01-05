import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UiKitsNgxLayoutTablesModule } from '@tamu-gisc/ui-kits/ngx/layout/tables';

import { CorrectionLiteMapComponent } from './components/correction-lite-map/correction-lite-map.component';
import { CorrectionDataTableComponent } from './components/correction-data-table/correction-data-table.component';
import { CorrectionMiscControlsComponent } from './components/correction-misc-controls/correction-misc-controls.component';
import { DbResetModalComponent } from './components/modals/db-reset-modal/db-reset-modal.component';

@NgModule({
  imports: [CommonModule, EsriMapModule, UIFormsModule, UiKitsNgxLayoutTablesModule],
  declarations: [
    CorrectionLiteMapComponent,
    CorrectionDataTableComponent,
    CorrectionMiscControlsComponent,
    DbResetModalComponent
  ],
  exports: [CorrectionLiteMapComponent, CorrectionDataTableComponent, CorrectionMiscControlsComponent]
})
export class CorrectionNgxModule {}
