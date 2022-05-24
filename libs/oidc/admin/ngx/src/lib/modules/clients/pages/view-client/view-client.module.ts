import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ViewClientComponent } from './view-client.component';

const routes: Routes = [
  {
    path: '',
    component: ViewClientComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ViewClientComponent],
  exports: [RouterModule]
})
export class ViewClientModule {}
