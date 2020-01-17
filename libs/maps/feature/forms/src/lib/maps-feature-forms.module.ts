import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';

import { LayerConfigurationComponent } from './components/layer-configuration/layer-configuration.component';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [LayerConfigurationComponent],
  exports: [LayerConfigurationComponent]
})
export class MapsFormsModule {}
