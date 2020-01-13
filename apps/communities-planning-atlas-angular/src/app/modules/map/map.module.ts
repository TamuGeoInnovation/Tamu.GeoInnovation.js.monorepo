import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { MapComponent } from './map.component';
import { SearchModule } from '@tamu-gisc/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { LayerSearchModule } from '@tamu-gisc/maps/feature/layer-search';

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
    HttpClientModule,
    EsriMapModule,
    SearchModule,
    SidebarModule,
    LayerListModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    LayerSearchModule
  ],
  declarations: [MapComponent],
  exports: [RouterModule]
})
export class MapModule {}
