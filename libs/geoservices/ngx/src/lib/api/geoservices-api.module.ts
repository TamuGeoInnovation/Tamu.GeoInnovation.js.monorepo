import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';

import { GeoservicesApiComponent } from './geoservices-api.component';

export const routes: Route[] = [
  {
    path: '',
    component: GeoservicesApiComponent,
    children: [
      {
        path: 'getting-started',
        loadChildren: () => import('./pages/implementations/implementations.module').then((m) => m.ImplementationsModule)
      },
      {
        path: 'geocoding',
        loadChildren: () => import('./pages/geocoding/geocoding.module').then((m) => m.GeocodingModule)
      },
      {
        path: 'reverse-geocoding',
        loadChildren: () =>
          import('./pages/reverse-geocoding/reverse-geocoding.module').then((m) => m.ReverseGeocodingModule)
      },
      {
        path: 'address-processing',
        loadChildren: () =>
          import('./pages/address-processing/address-processing.module').then((m) => m.AddressProcessingModule)
      },
      {
        path: 'census-intersection',
        loadChildren: () =>
          import('./pages/census-intersection/census-intersection.module').then((m) => m.CensusIntersectionModule)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'getting-started'
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, UIScrollToModule],
  declarations: [GeoservicesApiComponent],
  exports: [RouterModule]
})
export class GeoservicesApiModule {}
