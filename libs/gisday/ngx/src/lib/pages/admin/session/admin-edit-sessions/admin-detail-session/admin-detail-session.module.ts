import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailSessionComponent } from './admin-detail-session.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailSessionComponent
  }
];

@NgModule({
  declarations: [AdminDetailSessionComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailSessionModule {}
