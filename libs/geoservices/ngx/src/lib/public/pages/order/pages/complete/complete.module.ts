import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { CompleteComponent } from './complete.component';

const routes: Routes = [
  {
    path: '',
    component: CompleteComponent
  }
];
@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [CompleteComponent]
})
export class CompleteModule {}
