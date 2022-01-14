import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { MapComponent } from './components/map/map.component';
import { SearchModule } from '@tamu-gisc/ui-kits/ngx/search';

import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { LayerFilterModule } from '@tamu-gisc/maps/feature/layer-filter';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { UiKitsNgxChartsModule } from '@tamu-gisc/ui-kits/ngx/charts';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { SignageModule } from '@tamu-gisc/signage';

const routes: Routes = [{ path: '', component: MapComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    SearchModule,
    SidebarModule,
    UITamuBrandingModule,
    LayerListModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    LayerFilterModule,
    FeatureSelectorModule,
    UiKitsNgxChartsModule,
    MapDrawingModule,
    MapPopupModule,
    SignageModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
