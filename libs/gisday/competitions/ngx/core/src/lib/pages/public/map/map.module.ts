import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { MapComponent } from './components/map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

@NgModule({ declarations: [MapComponent],
    exports: [MapComponent], imports: [RouterModule.forChild(routes), CommonModule, EsriMapModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class MapModule {}
