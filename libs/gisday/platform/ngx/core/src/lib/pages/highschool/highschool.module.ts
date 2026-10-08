import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { HighschoolComponent } from './highschool.component';

const routes: Routes = [
  {
    path: '',
    component: HighschoolComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), HighschoolComponent],
  exports: [RouterModule]
})
export class HighschoolModule {}
