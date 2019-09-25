import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayerListComponent } from './components/layer-list/layer-list.component';
import { LayerListCategorizedComponent } from './components/layer-list-categorized/layer-list-categorized.component';

import { LayerListService } from './services/layer-list.service';

@NgModule({
  imports: [CommonModule],
  providers: [LayerListService],
  declarations: [LayerListComponent, LayerListCategorizedComponent],
  exports: [LayerListComponent, LayerListCategorizedComponent]
})
export class LayerListModule {}
