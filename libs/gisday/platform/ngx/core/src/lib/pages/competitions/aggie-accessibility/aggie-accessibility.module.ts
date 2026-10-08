import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';



import { AggieAccessibilityComponent } from './aggie-accessibility.component';

const routes: Routes = [
  {
    path: '',
    component: AggieAccessibilityComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), AggieAccessibilityComponent],
  exports: [RouterModule]
})
export class AggieAccessibilityModule {}
