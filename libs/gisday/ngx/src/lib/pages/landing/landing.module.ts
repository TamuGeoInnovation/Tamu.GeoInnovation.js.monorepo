import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing.component';
import { CountDownModule } from '../../modules/count-down/count-down.module';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  }
];

@NgModule({
  declarations: [LandingComponent],
  imports: [CommonModule, RouterModule.forChild(routes), CountDownModule],
  exports: [RouterModule]
})
export class LandingModule {}
