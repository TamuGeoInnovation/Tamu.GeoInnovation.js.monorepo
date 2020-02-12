import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BalanceComponent } from './balance.component';

const routes: Routes = [
  {
    path: '',
    component: BalanceComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [BalanceComponent],
  exports: [RouterModule]
})
export class BalanceModule {}
