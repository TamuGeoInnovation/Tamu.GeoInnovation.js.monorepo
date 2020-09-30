import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddEventsComponent } from './admin-add-events.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddEventsComponent
  }
];

@NgModule({
  declarations: [AdminAddEventsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddEventsModule {}
