import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { Wayback2019Component } from './wayback-2019.component';

const routes: Routes = [
  {
    path: '',
    component: Wayback2019Component
  }
];

@NgModule({
  declarations: [Wayback2019Component],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Wayback2019Module {}
