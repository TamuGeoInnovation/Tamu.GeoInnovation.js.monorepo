import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLockdownsComponent } from './admin-lockdowns.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLockdownsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [AdminLockdownsComponent]
})
export class AdminLockdownsModule {}
