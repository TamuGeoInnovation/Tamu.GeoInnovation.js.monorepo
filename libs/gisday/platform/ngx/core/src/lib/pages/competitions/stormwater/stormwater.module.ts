import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { StormwaterComponent } from './stormwater.component';

const routes: Routes = [
  {
    path: '',
    component: StormwaterComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), StormwaterComponent],
  exports: [RouterModule]
})
export class StormwaterModule {}
