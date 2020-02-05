import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { RefillComponent } from './refill.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RefillComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [RefillComponent],
  exports: [RouterModule]
})
export class RefillModule {}
