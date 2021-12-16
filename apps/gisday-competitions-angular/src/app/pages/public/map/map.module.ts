import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { MapComponent } from './components/map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [RouterModule.forChild(routes), CommonModule, HttpClientModule, EsriMapModule]
})
export class MapModule {}
