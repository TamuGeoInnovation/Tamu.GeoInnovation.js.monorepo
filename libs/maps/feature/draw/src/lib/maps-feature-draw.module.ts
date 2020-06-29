import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseDrawComponent } from './components/base/base.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseDrawComponent],
  exports: [BaseDrawComponent]
})
export class MapDrawingModule {}
