import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LayerFilterComponent],
  exports: [LayerFilterComponent]
})
export class LayerFilterModule {}
