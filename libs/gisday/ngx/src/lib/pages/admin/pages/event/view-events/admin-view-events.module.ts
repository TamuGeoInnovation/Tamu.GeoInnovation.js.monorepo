import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewEventsComponent } from './admin-view-events.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewEventsComponent
  }
];

@NgModule({
  declarations: [AdminViewEventsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewEventsModule {}
