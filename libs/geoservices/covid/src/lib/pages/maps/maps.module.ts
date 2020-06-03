import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MapsComponent } from './maps.component';
import { TimeMapComponent } from './components/time-map/time-map.component';
import { MapsMapboxModule } from '@tamu-gisc/maps/mapbox';
import { HttpClientModule } from '@angular/common/http';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

const routes: Routes = [
  {
    path: '',
    component: MapsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'time-map'
      },
      {
        path: 'time-map',
        component: TimeMapComponent
      }
    ]
  }
]

@NgModule({
  declarations: [MapsComponent, TimeMapComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes), MapsMapboxModule, HttpClientModule,UILayoutModule
  ]
})
export class MapsModule { }
