import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';

import { MapComponent } from './map.component';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    children: [
      {
        path: '',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), EsriMapModule, MapPopupModule, UILayoutModule, ComponentsModule],
  declarations: [MapComponent]
})
export class MapModule {}
