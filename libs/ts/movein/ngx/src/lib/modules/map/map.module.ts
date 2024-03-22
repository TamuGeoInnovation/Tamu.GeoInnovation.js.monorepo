import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

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
    UITamuBrandingModule,
    EsriMapModule,
    MapsFeatureCoordinatesModule,
    MapsFeatureAccessibilityModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
