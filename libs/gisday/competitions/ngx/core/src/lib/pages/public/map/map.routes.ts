import { Routes } from '@angular/router';

import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

import { MapComponent } from './components/map.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent
  }
];

export const mapRoutes: Routes = [
  { path: '', providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())], children: routes }
];
