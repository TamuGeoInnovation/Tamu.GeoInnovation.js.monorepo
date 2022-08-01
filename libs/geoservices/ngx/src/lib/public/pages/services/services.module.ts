import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

const routes: Routes = [
  {
    path: 'geocoding',
    loadChildren: () => import('./pages/geocoding/geocoding.module').then((m) => m.GeocodingModule)
  },
  {
    path: 'reverse-geocoding',
    loadChildren: () => import('./pages/reverse-geocoding/reverse-geocoding.module').then((m) => m.ReverseGeocodingModule)
  },
  {
    path: 'census-intersection',
    loadChildren: () =>
      import('./pages/census-intersection/census-intersection.module').then((m) => m.CensusIntersectionModule)
  },
  {
    path: 'address-processing',
    loadChildren: () => import('./pages/address-processing/address-processing.module').then((m) => m.AddressProcessingModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'geocoding'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule]
})
export class ServicesModule {}
