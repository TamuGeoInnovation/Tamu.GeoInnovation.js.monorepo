import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { CpaAdminComponent } from './cpa-admin.component';

const routes: Routes = [
  {
    path: '',
    component: CpaAdminComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'workshops'
      },
      {
        path: 'workshops',
        loadChildren: () => import('./pages/workshops/workshops.module').then((m) => m.WorkshopsModule)
      },
      {
        path: 'snapshots',
        loadChildren: () => import('./pages/snapshots/snapshots.module').then((m) => m.SnapshotsModule)
      },
      {
        path: 'scenarios',
        loadChildren: () => import('./pages/scenarios/scenarios.module').then((m) => m.ScenariosModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule],
  declarations: [CpaAdminComponent]
})
export class CpaAdminModule {}
