import { Routes } from '@angular/router';

import { GeoservicesPublicComponent } from './geoservices-public.component';

export const geoservicesPublicRoutes: Routes = [
  {
    path: '',
    component: GeoservicesPublicComponent,
    children: [
      {
        path: 'pricing',
        loadChildren: () => import('./pages/pricing/pricing.routes').then((m) => m.pricingRoutes)
      },
      {
        path: 'services',
        loadChildren: () => import('./pages/services/services.routes').then((m) => m.servicesRoutes)
      },
      {
        path: 'contact',
        loadChildren: () => import('./pages/contact/contact.routes').then((m) => m.contactRoutes)
      },
      {
        path: 'about',
        loadChildren: () => import('./pages/about/about.routes').then((m) => m.aboutRoutes)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/landing/landing.routes').then((m) => m.landingRoutes)
      }
    ]
  }
];
