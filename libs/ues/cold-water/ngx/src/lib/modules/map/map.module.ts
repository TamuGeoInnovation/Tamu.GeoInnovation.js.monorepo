import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';

import { MapComponent } from './map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../info/info.module').then((m) => m.InfoModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EsriMapModule,
    UESCoreUIModule,
    UITamuBrandingModule,
    FeatureSelectorModule
  ],
  declarations: [MapComponent]
})
export class MapModule {}
