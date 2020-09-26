import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PresentersViewComponent } from './presenters-view.component';

const routes: Routes = [
  {
    path: '',
    component: PresentersViewComponent
  }
];

@NgModule({
  declarations: [PresentersViewComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentersViewModule {}
