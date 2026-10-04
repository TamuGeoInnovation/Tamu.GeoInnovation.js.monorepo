import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { LayerConfigurationComponent } from './components/layer-configuration/layer-configuration.component';

@NgModule({
  declarations: [LayerConfigurationComponent],
  exports: [LayerConfigurationComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UIFormsModule],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class MapsFormsModule {}
