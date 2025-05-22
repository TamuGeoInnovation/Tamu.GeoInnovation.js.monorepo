import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SubscriptionComponent } from './subscription.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [SubscriptionComponent]
})
export class SubscriptionModule {}
