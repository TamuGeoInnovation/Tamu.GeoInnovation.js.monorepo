import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSpeakersComponent } from './admin-edit-speakers.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSpeakersComponent,
    pathMatch: 'full'
  },
  {
    path: ':guid',
    loadChildren: () => import('./admin-detail-speaker/admin-detail-speaker.module').then((m) => m.AdminDetailSpeakerModule)
  }
];

@NgModule({
  declarations: [AdminEditSpeakersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSpeakersModule {}
