import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { DataComponent } from './data.component';

const routes: Routes = [
  {
    path: '',
    component: DataComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'latest'
      },
      {
        path: 'latest',
        loadChildren: () => import('./pages/existing/existing.module').then((m) => m.ExistingModule)
      },
      {
        path: 'upload',
        loadChildren: () => import('./pages/upload/upload.module').then((m) => m.UploadModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DataComponent]
})
export class DataModule {}
