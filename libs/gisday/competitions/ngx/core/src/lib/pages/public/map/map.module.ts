import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { EsriMapComponent } from '@tamu-gisc/maps/esri';

import { MapComponent } from './components/map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

@NgModule({
  exports: [MapComponent],
  imports: [RouterModule.forChild(routes), CommonModule, EsriMapComponent, MapComponent],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())]
})
export class MapModule {}
