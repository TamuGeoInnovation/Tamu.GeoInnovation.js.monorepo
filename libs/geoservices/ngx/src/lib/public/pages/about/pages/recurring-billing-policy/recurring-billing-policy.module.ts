import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { RecurringBillingPolicyComponent } from './recurring-billing-policy.component';

const routes: Routes = [
  {
    path: '',
    component: RecurringBillingPolicyComponent
  }
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), RecurringBillingPolicyComponent]
})
export class RecurringBillingPolicyModule {}
