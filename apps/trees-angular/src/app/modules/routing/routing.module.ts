import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { HttpClientModule } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { UiKitsNgxChartsModule } from '@tamu-gisc/ui-kits/ngx/charts';

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
    families: ['Material Icons', 'Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
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
    FeatureSelectorModule,
    UiKitsNgxChartsModule,
    MapDrawingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
