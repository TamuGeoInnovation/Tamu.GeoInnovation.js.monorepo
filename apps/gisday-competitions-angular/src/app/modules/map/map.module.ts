import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { ChartsModule } from '@tamu-gisc/charts';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { MapComponent } from './components/map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

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
    ChartsModule,
    UITamuBrandingModule
  ],

  providers: [EsriModuleProviderService]
})
export class MapModule {}
