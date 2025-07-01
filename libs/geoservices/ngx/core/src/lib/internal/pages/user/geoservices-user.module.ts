import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeoservicesUserComponent } from './geoservices-user.component';

const routes: Routes = [
  {
    path: '',
    component: GeoservicesUserComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'account'
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then((m) => m.AccountModule)
      },
      {
        path: 'credits',
        loadChildren: () => import('./credits/credits.module').then((m) => m.CreditsModule)
      },
      {
        path: 'databases',
        loadChildren: () => import('./databases/databases.module').then((m) => m.DatabasesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [GeoservicesUserComponent],
  exports: [RouterModule]
})
export class GeoservicesUserModule {}
