import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details'
      },
      {
        path: 'details',
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
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SettingsComponent],
  exports: [RouterModule]
})
export class SettingsModule {}
