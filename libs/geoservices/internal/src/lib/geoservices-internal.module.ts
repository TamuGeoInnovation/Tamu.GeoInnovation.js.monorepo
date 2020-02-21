import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { InternalComponent } from './geoservices-internal.component';

export const geoservicesModulesInternalRoutes: Route[] = [];

const routes: Routes = [
  {
    path: '',
    component: InternalComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'account'
      },
      {
        path: 'account',
        loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule)
      },
      {
        path: 'credits',
        loadChildren: () => import('./pages/credits/credits.module').then((m) => m.CreditsModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [InternalComponent],
  exports: [RouterModule]
})
export class GeoservicesInternalModule {}
