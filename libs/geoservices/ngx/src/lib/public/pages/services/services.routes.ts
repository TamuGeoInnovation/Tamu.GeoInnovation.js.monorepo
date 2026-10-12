import { Routes } from '@angular/router';

export const servicesRoutes: Routes = [
  {
    path: 'geocoding',
    loadChildren: () => import('./pages/geocoding/geocoding.routes').then((m) => m.geocodingRoutes)
  },
  {
    path: 'reverse-geocoding',
    loadChildren: () => import('./pages/reverse-geocoding/reverse-geocoding.routes').then((m) => m.reverseGeocodingRoutes)
  },
  {
    path: 'census-intersection',
    loadChildren: () =>
      import('./pages/census-intersection/census-intersection.routes').then((m) => m.censusIntersectionRoutes)
  },
  {
    path: 'address-processing',
    loadChildren: () => import('./pages/address-processing/address-processing.routes').then((m) => m.addressProcessingRoutes)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'geocoding'
  }
];
