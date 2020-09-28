import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AccountComponent } from './account.component';
import { AccoutHeaderComponent } from '../../modules/accout-header/accout-header.component';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/my-details/my-details.module').then((m) => m.MyDetailsModule)
      },
      {
        path: 'my-classes',
        loadChildren: () => import('./pages/my-classes/my-classes.module').then((m) => m.MyClassesModule)
      },
      {
        path: 'my-checkins',
        loadChildren: () => import('./pages/my-checkins/my-checkins.module').then((m) => m.MyCheckinsModule)
      },
      {
        path: 'my-details',
        loadChildren: () => import('./pages/my-details/my-details.module').then((m) => m.MyDetailsModule)
      },
      {
        path: 'my-submissions',
        loadChildren: () => import('./pages/my-submissions/my-submissions.module').then((m) => m.MySubmissionsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AccountComponent, AccoutHeaderComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountModule {}
