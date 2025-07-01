import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ContactFormModule } from '@tamu-gisc/geoservices/ngx/common';

import { ContactUsComponent } from './contact-us.component';

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
