import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminAddSponsorsComponent } from './admin-add-sponsors.component';

const routes: Routes = [
  {
    path: '',
    component: AdminAddSponsorsComponent
  }
];

@NgModule({
  declarations: [AdminAddSponsorsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAddSponsorsModule {}
