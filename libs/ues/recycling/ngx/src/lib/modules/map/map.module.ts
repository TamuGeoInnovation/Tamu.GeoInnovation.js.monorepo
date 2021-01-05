import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';

import { MapComponent } from './map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    UESCoreUIModule,
    MapsFeatureCoordinatesModule,
    MapsFeatureAccessibilityModule,
    LayerListModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
