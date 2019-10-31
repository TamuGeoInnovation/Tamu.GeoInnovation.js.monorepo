import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { HttpClientModule } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

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
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    EsriMapModule,
    UITamuBrandingModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
