import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DataComponent } from './data.component';

const routes: Routes = [
  {
    path: '',
    component: DataComponent,
    children: [
      {
        path: 'latest',
        loadChildren: () => import('./pages/existing/existing.module').then((m) => m.ExistingModule)
      },
      {
        path: 'upload',
        loadChildren: () => import('./pages/upload/upload.module').then((m) => m.UploadModule)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'latest'
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [DataComponent]
})
export class DataModule {}
