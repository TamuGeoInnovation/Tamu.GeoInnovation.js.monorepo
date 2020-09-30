import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailSpeakerComponent } from './admin-detail-speaker.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailSpeakerComponent
  }
];

@NgModule({
  declarations: [AdminDetailSpeakerComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailSpeakerModule {}
