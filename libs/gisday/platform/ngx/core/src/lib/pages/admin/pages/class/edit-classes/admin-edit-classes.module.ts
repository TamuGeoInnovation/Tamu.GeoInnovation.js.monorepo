import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditClassesComponent } from './admin-edit-classes.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditClassesComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./detail-class/admin-detail-class.module').then((m) => m.AdminDetailClassModule)
  }
];

@NgModule({
  declarations: [AdminEditClassesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditClassesModule {}
