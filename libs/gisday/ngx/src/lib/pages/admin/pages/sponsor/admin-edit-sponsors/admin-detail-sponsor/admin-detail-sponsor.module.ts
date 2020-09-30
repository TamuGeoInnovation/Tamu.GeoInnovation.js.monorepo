import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AdminDetailSponsorComponent } from './admin-detail-sponsor.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDetailSponsorComponent
  }
];

@NgModule({
  declarations: [AdminDetailSponsorComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDetailSponsorModule {}
