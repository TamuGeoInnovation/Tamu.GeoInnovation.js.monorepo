import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttributeTableComponent } from './components/attribute-table/attribute-table.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AttributeTableComponent],
  exports: [AttributeTableComponent]
})
export class MapsFeatureDataModule {}
