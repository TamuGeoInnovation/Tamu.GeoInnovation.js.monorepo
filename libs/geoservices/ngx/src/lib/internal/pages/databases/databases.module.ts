import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DatabasesComponent } from './databases.component';

const routes: Routes = [
  {
    path: '',
    component: DatabasesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'existing'
      },
      {
        path: 'existing',
        loadChildren: () => import('./uploaded/uploaded.module').then((m) => m.UploadedModule)
      },
      {
        path: 'upload',
        loadChildren: () => import('./upload/upload.module').then((m) => m.UploadModule)
      },
      {
        path: 'share',
        loadChildren: () => import('./share/share.module').then((m) => m.ShareModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DatabasesComponent]
})
export class DatabasesModule {}
