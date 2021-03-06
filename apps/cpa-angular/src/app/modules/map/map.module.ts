import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';

import { MapComponent } from './map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    children: [
      {
        path: '',
        redirectTo: 'viewer'
      },
      {
        path: 'viewer',
        loadChildren: () => import('@tamu-gisc/cpa/common/ngx').then((m) => m.CpaViewerModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    MapDrawingModule,
    MapPopupModule
  ],
  declarations: [MapComponent],
  exports: [RouterModule]
})
export class MapModule {}
