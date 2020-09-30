import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminClassComponent } from './admin-class.component';

const routes: Routes = [
  {
    path: '',
    component: AdminClassComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-classes/admin-view-classes.module').then((m) => m.AdminViewClassesModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./edit-classes/admin-edit-classes.module').then((m) => m.EditClassesModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./edit-classes/detail-class/admin-detail-class.module').then((m) => m.AdminDetailClassModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./add-classes/admin-add-classes.module').then((m) => m.AdminAddClassesModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminClassComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminClassModule {}
