import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddCheckinsComponent } from './admin-add-checkins.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddCheckinsComponent
  }
];

@NgModule({
  declarations: [AdminAddCheckinsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddCheckinsModule {}
