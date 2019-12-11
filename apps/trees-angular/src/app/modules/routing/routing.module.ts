import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { HttpClientModule } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { FeaetureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { ChartsModule } from '@tamu-gisc/charts';

import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LayerFilterModule } from '@tamu-gisc/maps/feature/layer-filter';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

import { MapComponent } from '../../components/map/map.component';

const routes: Routes = [{ path: '', component: MapComponent }];

WebFont.load({
  google: {
    families: ['Material Icons']
  },
  custom: {
    families: ['Moriston', 'Tungsten'],
    urls: ['assets/fonts/moriston_pro/moriston_pro.css', 'assets/fonts/tungsten/tungsten.css']
  }
});

@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    HttpClientModule,
    EsriMapModule,
    SearchModule,
    SidebarModule,
    UITamuBrandingModule,
    LayerFilterModule,
    LayerListModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    FeaetureSelectorModule,
    ChartsModule,
    MapDrawingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
