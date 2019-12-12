import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseComponent } from './components/base/base.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BaseComponent],
  exports: [BaseComponent]
})
export class MapDrawingModule {}
