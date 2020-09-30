import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailClassComponent } from './admin-detail-class.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailClassComponent
  }
];

@NgModule({
  declarations: [AdminDetailClassComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailClassModule {}
