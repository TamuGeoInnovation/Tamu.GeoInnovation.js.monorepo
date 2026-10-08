import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AdminSubmissionsComponent } from './admin-submissions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSubmissionsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AdminSubmissionsComponent]
})
export class AdminSubmissionsModule {}
