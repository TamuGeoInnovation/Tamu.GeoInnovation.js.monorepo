import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsriMapComponent } from './components/esri-map/esri-map.component';

import { EsriMapService } from './services/map.service';
import { EsriModuleProviderService } from './services/module-provider.service';

@NgModule({
  imports: [CommonModule],
  declarations: [EsriMapComponent],
  providers: [EsriModuleProviderService, EsriMapService],
  exports: [EsriMapComponent]
})
export class EsriMapModule {}
