import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { BaseDrawComponent } from './components/base/base.component';
import { MapDrawBasicComponent } from './components/map-draw-basic/map-draw-basic.component';
import { MapDrawAdvancedComponent } from './components/map-draw-advanced/map-draw-advanced.component';

@NgModule({
  imports: [CommonModule, UILayoutModule],
  declarations: [BaseDrawComponent, MapDrawBasicComponent, MapDrawAdvancedComponent],
  exports: [MapDrawBasicComponent, MapDrawAdvancedComponent]
})
export class MapDrawingModule {}
