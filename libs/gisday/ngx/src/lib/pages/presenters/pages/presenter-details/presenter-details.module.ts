import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PresenterDetailsComponent } from './presenter-details.component';

const routes: Routes = [
  {
    path: '',
    component: PresenterDetailsComponent
  }
];

@NgModule({
  declarations: [PresenterDetailsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresenterDetailsModule {}
