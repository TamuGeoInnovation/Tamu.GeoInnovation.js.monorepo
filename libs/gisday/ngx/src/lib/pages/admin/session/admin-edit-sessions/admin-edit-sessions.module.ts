import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSessionsComponent } from './admin-edit-sessions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSessionsComponent
  }
];

@NgModule({
  declarations: [AdminEditSessionsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSessionsModule {}
