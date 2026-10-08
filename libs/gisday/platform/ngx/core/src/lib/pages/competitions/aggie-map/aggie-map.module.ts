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
    imports: [CommonModule, RouterModule.forChild(routes), AggieMapComponent],
    exports: [RouterModule]
})
export class AggieMapModule {}
