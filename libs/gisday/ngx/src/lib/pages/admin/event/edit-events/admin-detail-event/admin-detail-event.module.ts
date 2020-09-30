import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailEventComponent } from './admin-detail-event.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailEventComponent
  }
];

@NgModule({
  declarations: [AdminDetailEventComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailEventModule {}
