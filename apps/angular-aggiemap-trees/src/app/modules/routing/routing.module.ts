import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { HttpClientModule } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';

import { TamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

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
    TamuBrandingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
