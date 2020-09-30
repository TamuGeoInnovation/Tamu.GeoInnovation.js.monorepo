import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddSessionsComponent } from './admin-add-sessions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddSessionsComponent
  }
];

@NgModule({
  declarations: [AdminAddSessionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddSessionsModule {}
