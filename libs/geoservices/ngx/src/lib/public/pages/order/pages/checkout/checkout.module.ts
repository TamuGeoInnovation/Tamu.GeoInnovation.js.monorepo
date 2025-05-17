import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthGuard } from '@tamu-gisc/geoservices/data-access';

import { CheckoutComponent } from './checkout.component';
import { UserDetailsFormModule } from '../../../../../core/modules/forms/user/user-details-form/user-details-form.module';
import { UserMailingFormModule } from '../../../../../core/modules/forms/user/user-mailing-form/user-mailing-form.module';

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
