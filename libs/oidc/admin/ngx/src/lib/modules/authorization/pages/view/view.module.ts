import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ViewComponent } from './view.component';

const routes: Routes = [
  {
    path: '',
    component: ViewComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ViewComponent],
  exports: [RouterModule]
})
export class ViewModule {}
