import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddSpeakersComponent } from './admin-add-speakers.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddSpeakersComponent
  }
];

@NgModule({
  declarations: [AdminAddSpeakersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddSpeakersModule {}
