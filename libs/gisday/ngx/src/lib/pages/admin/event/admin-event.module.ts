import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEventComponent } from './admin-event.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEventComponent
  }
];

@NgModule({
  declarations: [AdminEventComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEventModule {}
