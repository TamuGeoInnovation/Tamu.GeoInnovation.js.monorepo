import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthGuard } from '@tamu-gisc/geoservices/ngx/data-access';
import { UserDetailsFormModule, UserMailingFormModule } from '@tamu-gisc/geoservices/ngx/common';

import { CheckoutComponent } from './checkout.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UserDetailsFormModule, UserMailingFormModule],
  declarations: [CheckoutComponent]
})
export class CheckoutModule {}
