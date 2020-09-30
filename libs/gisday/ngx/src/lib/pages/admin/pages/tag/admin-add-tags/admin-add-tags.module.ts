import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddTagsComponent } from './admin-add-tags.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddTagsComponent
  }
];

@NgModule({
  declarations: [AdminAddTagsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddTagsModule {}
