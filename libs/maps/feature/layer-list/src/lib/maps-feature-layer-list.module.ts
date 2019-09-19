import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayerListService } from './services/layer-list.service';

@NgModule({
  imports: [CommonModule],
  providers: [LayerListService]
})
export class LayerListModule {}
