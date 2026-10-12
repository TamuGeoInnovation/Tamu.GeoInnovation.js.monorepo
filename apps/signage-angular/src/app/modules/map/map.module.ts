import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapComponent } from '@tamu-gisc/maps/esri';

import { MapComponent } from './components/map/map.component';
import { SearchComponent, SearchMobileComponent, SearchResultPipe } from '@tamu-gisc/ui-kits/ngx/search';

import { SidebarComponent, SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';

import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { LayerFilterModule } from '@tamu-gisc/maps/feature/layer-filter';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import {
  BaseChartComponent,
  BarChartComponent,
  LineChartComponent,
  DoughnutChartComponent,
  PieChartComponent
} from '@tamu-gisc/ui-kits/ngx/charts';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { PopupComponent, PopupMobileComponent, RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';
import { SignageModule } from '@tamu-gisc/signage';

const routes: Routes = [{ path: '', component: MapComponent }];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapComponent,
    SearchComponent,
    SearchMobileComponent,
    SearchResultPipe,
    SidebarComponent,
    SidebarTabComponent,
    UITamuBrandingModule,
    LayerListModule,
    CommonNgxRouterModule,
    LayerFilterModule,
    FeatureSelectorModule,
    BaseChartComponent,
    BarChartComponent,
    LineChartComponent,
    DoughnutChartComponent,
    PieChartComponent,
    MapDrawingModule,
    PopupComponent,
    PopupMobileComponent,
    RevealSidebarOnPopupDirective,
    SignageModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
