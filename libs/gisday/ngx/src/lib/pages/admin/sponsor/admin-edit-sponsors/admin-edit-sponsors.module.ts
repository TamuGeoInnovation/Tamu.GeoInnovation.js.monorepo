import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminEditSponsorsComponent } from './admin-edit-sponsors.component';

const routes: Routes = [
  {
    path: '',
    component: AdminEditSponsorsComponent
  }
];

@NgModule({
  declarations: [AdminEditSponsorsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminEditSponsorsModule {}
