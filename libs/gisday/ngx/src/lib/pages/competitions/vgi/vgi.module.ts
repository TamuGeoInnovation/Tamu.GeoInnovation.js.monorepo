import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { VgiComponent } from './vgi.component';

const routes: Routes = [
  {
    path: '',
    component: VgiComponent
  }
];

@NgModule({
  declarations: [VgiComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VgiModule {}
