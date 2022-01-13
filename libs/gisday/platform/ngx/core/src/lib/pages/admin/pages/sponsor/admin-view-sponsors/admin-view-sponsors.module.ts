import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminViewSponsorsComponent } from './admin-view-sponsors.component';

const routes: Routes = [
  {
    path: '',
    component: AdminViewSponsorsComponent
  }
];

@NgModule({
  declarations: [AdminViewSponsorsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminViewSponsorsModule {}
