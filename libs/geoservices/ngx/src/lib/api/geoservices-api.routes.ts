import { Routes } from '@angular/router';

import { GeoservicesApiComponent } from './geoservices-api.component';

export const geoservicesApiRoutes: Routes = [
  {
    path: '',
    component: GeoservicesApiComponent,
    children: [
      {
        path: 'getting-started',
        loadChildren: () => import('./pages/implementations/implementations.routes').then((m) => m.implementationsRoutes)
      },
      {
        path: 'geocoding',
        loadChildren: () => import('./pages/geocoding/geocoding.routes').then((m) => m.geocodingRoutes)
      },
      {
        path: 'reverse-geocoding',
        loadChildren: () =>
          import('./pages/reverse-geocoding/reverse-geocoding.routes').then((m) => m.reverseGeocodingRoutes)
      },
      {
        path: 'address-processing',
        loadChildren: () =>
          import('./pages/address-processing/address-processing.routes').then((m) => m.addressProcessingRoutes)
      },
      {
        path: 'census-intersection',
        loadChildren: () =>
          import('./pages/census-intersection/census-intersection.routes').then((m) => m.censusIntersectionRoutes)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'getting-started'
      }
    ]
  }
];
