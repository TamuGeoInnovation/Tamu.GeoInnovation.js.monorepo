import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';



import { SidewalkComponent } from './sidewalk.component';

const routes: Routes = [
  {
    path: '',
    component: SidewalkComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), SidewalkComponent],
  exports: [RouterModule]
})
export class SidewalkModule {}
