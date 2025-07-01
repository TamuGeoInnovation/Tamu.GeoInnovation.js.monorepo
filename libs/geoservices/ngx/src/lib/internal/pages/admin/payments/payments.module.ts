import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Payments</h1><p>Admin payments functionality will be implemented here.</p></div>'
})
export class PaymentsComponent {}

const routes: Routes = [
  {
    path: '',
    component: PaymentsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [PaymentsComponent],
  exports: [RouterModule]
})
export class PaymentsModule {}
