import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AccountComponent } from './account.component';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./details/details.module').then((m) => m.DetailsModule)
      },
      {
        path: 'security',
        loadChildren: () => import('./security/security.module').then((m) => m.SecurityModule)
      },
      {
        path: 'preferences',
        loadChildren: () => import('./preferences/preferences.module').then((m) => m.PreferencesModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [AccountComponent],
  exports: [RouterModule]
})
export class AccountModule {}
