import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { NotAuthedComponent } from './not-authed.component';

const routes: Routes = [
  {
    path: '',
    component: NotAuthedComponent
  }
];

@NgModule({
  declarations: [NotAuthedComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotAuthedModule {}
