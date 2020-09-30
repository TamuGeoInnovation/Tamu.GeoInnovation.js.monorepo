import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSpeakersComponent } from './admin-edit-speakers.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSpeakersComponent
  }
];

@NgModule({
  declarations: [AdminEditSpeakersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSpeakersModule {}
