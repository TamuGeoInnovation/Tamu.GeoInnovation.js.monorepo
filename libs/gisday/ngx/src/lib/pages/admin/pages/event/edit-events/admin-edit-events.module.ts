import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditEventsComponent } from './admin-edit-events.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditEventsComponent
  }
];

@NgModule({
  declarations: [AdminEditEventsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditEventsModule {}
