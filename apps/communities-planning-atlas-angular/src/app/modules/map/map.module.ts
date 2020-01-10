import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { MapComponent } from './map.component';
import { SearchModule } from '@tamu-gisc/search';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), HttpClientModule, EsriMapModule, SearchModule],
  declarations: [MapComponent],
  exports: [RouterModule]
})
export class MapModule {}
