import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ContactComponent } from './contact.component';

const routes: Routes = [
  {
    path: '',
    component: ContactComponent,
    children: [
      {
        path: 'address-correction',
        loadChildren: () =>
          import('./pages/address-correction/address-correction.module').then((m) => m.AddressCorrectionModule)
      },
      {
        path: 'bug-report',
        loadChildren: () => import('./pages/bug-report/bug-report.module').then((m) => m.BugReportModule)
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/contact-us/contact-us.module').then((m) => m.ContactUsModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ContactComponent]
})
export class ContactModule {}
