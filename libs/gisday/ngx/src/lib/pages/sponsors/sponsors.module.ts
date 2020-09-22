import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SponsorsComponent } from './sponsors.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsComponent
  }
];

@NgModule({
  declarations: [SponsorsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SponsorsModule {}
