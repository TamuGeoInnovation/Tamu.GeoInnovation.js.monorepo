import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FieldLabelPipe } from './field-label/field-label.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [FieldLabelPipe],
  exports: [FieldLabelPipe]
})
export class GeoservicesCommonPipesModule {}
