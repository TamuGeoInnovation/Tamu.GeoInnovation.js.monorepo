import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { LayerConfigurationComponent } from './components/layer-configuration/layer-configuration.component';

@NgModule({
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, UIFormsModule],
  declarations: [LayerConfigurationComponent],
  exports: [LayerConfigurationComponent]
})
export class MapsFormsModule {}
