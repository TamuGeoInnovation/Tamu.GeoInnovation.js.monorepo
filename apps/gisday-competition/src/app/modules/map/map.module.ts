import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { FeaetureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { ChartsModule } from '@tamu-gisc/charts';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LayerFilterModule } from '@tamu-gisc/maps/feature/layer-filter';

import { MapComponent } from '../../components/map/map.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: '', component: MapComponent
}]


@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    HttpClientModule,
    EsriMapModule,
    SearchModule,
    SidebarModule,
    FeaetureSelectorModule,
    ChartsModule,
    UITamuBrandingModule,
    LayerFilterModule,
    LayerListModule,
  ]
})
export class MapModule { }
