import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminUniversityComponent } from './admin-university.component';

const routes: Routes = [
  {
    path: '',
    component: AdminUniversityComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./admin-edit-university/admin-edit-university.module').then((m) => m.AdminEditUniversityModule)
      },
      {
        path: 'edit',
        loadChildren: () =>
          import('./admin-edit-university/admin-edit-university.module').then((m) => m.AdminEditUniversityModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-university/admin-detail-university/admin-detail-university.module').then(
            (m) => m.AdminDetailUniversityModule
          )
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./admin-add-university/admin-add-university.module').then((m) => m.AdminAddUniversityModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminUniversityComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminUniversityModule {}
