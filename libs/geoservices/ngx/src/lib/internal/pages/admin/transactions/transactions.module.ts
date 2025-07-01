import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Transactions</h1><p>Admin transactions functionality will be implemented here.</p></div>'
})
export class TransactionsComponent {}

const routes: Routes = [
  {
    path: '',
    component: TransactionsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [TransactionsComponent],
  exports: [RouterModule]
})
export class TransactionsModule {}
