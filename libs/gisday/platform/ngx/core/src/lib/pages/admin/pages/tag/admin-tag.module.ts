import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminTagComponent } from './admin-tag.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTagComponent,
    children: [
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-tags/admin-detail-tag/admin-detail-tag.module').then((m) => m.AdminDetailTagModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-tags/admin-add-tags.module').then((m) => m.AdminAddTagsModule)
      },
      {
        path: '',
        loadChildren: () => import('./admin-edit-tags/admin-edit-tags.module').then((m) => m.AdminEditTagsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminTagComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminTagModule {}
