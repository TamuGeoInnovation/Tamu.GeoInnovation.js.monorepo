import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PresentationComponent } from './presentation.component';

const routes: Routes = [
  {
    path: '',
    component: PresentationComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PresentationComponent],
  exports: [RouterModule]
})
export class PresentationModule {}
