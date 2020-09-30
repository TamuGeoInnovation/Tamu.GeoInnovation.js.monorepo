import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewSessionsComponent } from './admin-view-sessions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewSessionsComponent
  }
];

@NgModule({
  declarations: [AdminViewSessionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewSessionsModule {}
