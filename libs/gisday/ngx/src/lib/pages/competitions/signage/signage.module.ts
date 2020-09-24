import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SignageComponent } from './signage.component';

const routes: Routes = [
  {
    path: '',
    component: SignageComponent
  }
];

@NgModule({
  declarations: [SignageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignageModule {}
