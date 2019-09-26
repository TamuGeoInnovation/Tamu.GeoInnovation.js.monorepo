import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';

import { FeaetureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';

@NgModule({
  imports: [CommonModule, UIFormsModule, FeaetureSelectorModule],
  declarations: [LayerFilterComponent],
  exports: [LayerFilterComponent]
})
export class LayerFilterModule {}
