import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PresentersComponent } from './presenters.component';
import { PresenterDetailsComponent } from './presenter-details/presenter-details.component';

const routes: Routes = [
  {
    path: '',
    component: PresentersComponent
  }
];

@NgModule({
  declarations: [PresentersComponent, PresenterDetailsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentersModule {}
