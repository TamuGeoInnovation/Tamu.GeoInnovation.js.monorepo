import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewSpeakersComponent } from './admin-view-speakers.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewSpeakersComponent
  }
];

@NgModule({
  declarations: [AdminViewSpeakersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewSpeakersModule {}
