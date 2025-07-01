import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  template: '<div><h1>Subscriptions</h1><p>Admin subscriptions functionality will be implemented here.</p></div>'
})
export class SubscriptionsComponent {}

const routes: Routes = [
  {
    path: '',
    component: SubscriptionsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SubscriptionsComponent],
  exports: [RouterModule]
})
export class SubscriptionsModule {}
