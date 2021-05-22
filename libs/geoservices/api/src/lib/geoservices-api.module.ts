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
        path: '',
        pathMatch: 'full',
        redirectTo: 'geocoding'
      },
      {
        path: 'getting-started',
        loadChildren: () => import('./pages/implementations/implementations.module').then((m) => m.ImplementationsModule)
      },
      {
        path: 'geocoding',
        loadChildren: () => import('./pages/geocoding/geocoding.module').then((m) => m.GeocodingModule)
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
