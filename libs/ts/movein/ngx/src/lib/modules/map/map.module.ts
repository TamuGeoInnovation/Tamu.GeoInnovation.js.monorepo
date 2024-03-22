import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { MapsFeatureCoordinatesModule } from '@tamu-gisc/maps/feature/coordinates';
import { MapsFeatureAccessibilityModule } from '@tamu-gisc/maps/feature/accessibility';

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
    MapsFeatureAccessibilityModule,
    SearchModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
