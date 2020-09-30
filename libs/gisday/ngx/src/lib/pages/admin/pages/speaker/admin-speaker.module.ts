import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminSpeakerComponent } from './admin-speaker.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSpeakerComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./admin-view-speakers/admin-view-speakers.module').then((m) => m.AdminViewSpeakersModule)
      },
      {
        path: 'edit',
        loadChildren: () => import('./admin-edit-speakers/admin-edit-speakers.module').then((m) => m.AdminEditSpeakersModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () =>
          import('./admin-edit-speakers/admin-detail-speaker/admin-detail-speaker.module').then(
            (m) => m.AdminDetailSpeakerModule
          )
      },
      {
        path: 'add',
        loadChildren: () => import('./admin-add-speakers/admin-add-speakers.module').then((m) => m.AdminAddSpeakersModule)
      }
    ]
  }
];

@NgModule({
  declarations: [AdminSpeakerComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSpeakerModule {}
