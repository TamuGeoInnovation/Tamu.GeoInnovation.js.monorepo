import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Billing Overview</h1><p>Admin billing functionality will be implemented here.</p></div>'
})
export class BillingComponent {}

const routes: Routes = [
  {
    path: '',
    component: BillingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [BillingComponent],
  exports: [RouterModule]
})
export class BillingModule {}
