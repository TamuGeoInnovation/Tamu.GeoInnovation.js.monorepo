import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AggieMapComponent } from './aggie-map.component';

const routes: Routes = [
  {
    path: '',
    component: AggieMapComponent
  }
];

@NgModule({
  declarations: [AggieMapComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AggieMapModule {}
