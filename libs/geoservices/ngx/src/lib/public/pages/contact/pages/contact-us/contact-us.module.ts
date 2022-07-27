import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ContactUsComponent } from './contact-us.component';
import { ContactFormModule } from '../../../../../core/modules/forms/contact-form/contact-form.module';

const routes: Routes = [
  {
    path: '',
    component: ContactUsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ContactFormModule],
  declarations: [ContactUsComponent]
})
export class ContactUsModule {}
