import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { SearchModule } from '@tamu-gisc/search';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { ChartsModule } from '@tamu-gisc/charts';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { CpaCommonModule, BuilderComponent, ParticipantComponent } from '@tamu-gisc/cpa/common/ngx';

import { MapComponent } from './map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    children: [
      {
        path: 'create',
        component: BuilderComponent,
        children: [
          {
            path: ':id',
            component: BuilderComponent
          }
        ]
      },
      {
        path: 'workshop',
        component: ParticipantComponent,
        children: [
          {
            path: ':id',
            component: ParticipantComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    EsriMapModule,
    SearchModule,
    SidebarModule,
    LayerListModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    MapDrawingModule,
    MapPopupModule,
    FeatureSelectorModule,
    ChartsModule,
    UILayoutModule,
    UIFormsModule,
    CpaCommonModule
  ],
  declarations: [MapComponent],
  exports: [RouterModule]
})
export class MapModule {}
