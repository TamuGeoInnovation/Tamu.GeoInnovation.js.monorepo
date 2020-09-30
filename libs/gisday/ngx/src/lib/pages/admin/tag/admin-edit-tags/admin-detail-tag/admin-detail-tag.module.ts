import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailTagComponent } from './admin-detail-tag.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailTagComponent
  }
];

@NgModule({
  declarations: [AdminDetailTagComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailTagModule {}
