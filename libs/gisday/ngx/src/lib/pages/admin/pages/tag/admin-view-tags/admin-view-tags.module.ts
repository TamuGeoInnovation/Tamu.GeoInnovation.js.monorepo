import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewTagsComponent } from './admin-view-tags.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewTagsComponent
  }
];

@NgModule({
  declarations: [AdminViewTagsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewTagsModule {}
