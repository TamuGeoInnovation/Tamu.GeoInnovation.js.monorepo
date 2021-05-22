import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditUniversityComponent } from './admin-edit-university.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditUniversityComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () =>
      import('./admin-detail-university/admin-detail-university.module').then((m) => m.AdminDetailUniversityModule)
  }
];

@NgModule({
  declarations: [AdminEditUniversityComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditUniversityModule {}
