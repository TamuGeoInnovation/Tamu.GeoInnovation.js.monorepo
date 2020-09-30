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
        path: '',
        loadChildren: () => import('./admin-view-tags/admin-view-tags.module').then((m) => m.AdminViewTagsModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./admin-edit-tags/admin-edit-tags.module').then((m) => m.AdminEditTagsModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-tags/admin-detail-tag/admin-detail-tag.module').then((m) => m.AdminDetailTagModule)
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-tags/admin-add-tags.module').then((m) => m.AdminAddTagsModule)
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
