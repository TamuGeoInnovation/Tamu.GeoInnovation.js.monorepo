import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { MySubmissionsComponent } from './my-submissions.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: MySubmissionsComponent
//   }
// ];

const routes: Routes = [
  {
    path: '',
    component: MySubmissionsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./view-submission/view-submission.module').then((m) => m.ViewSubmissionModule)
      },
      {
        path: 'upload',
        loadChildren: () => import('./upload-submission/upload-submission.module').then((m) => m.UploadSubmissionModule)
      }
    ]
  }
];

@NgModule({
  declarations: [MySubmissionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule],
  exports: [RouterModule]
})
export class MySubmissionsModule {}
