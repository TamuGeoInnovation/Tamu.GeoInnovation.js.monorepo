import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditTagsComponent } from './admin-edit-tags.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditTagsComponent
  }
];

@NgModule({
  declarations: [AdminEditTagsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditTagsModule {}
