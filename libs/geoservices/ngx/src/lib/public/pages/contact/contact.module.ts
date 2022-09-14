import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'address-correction',
    loadChildren: () => import('./pages/address-correction/address-correction.module').then((m) => m.AddressCorrectionModule)
  },
  {
    path: 'bug-report',
    loadChildren: () => import('./pages/bug-report/bug-report.module').then((m) => m.BugReportModule)
  },
  {
    path: 'partnership',
    loadChildren: () => import('./pages/partner/partner.module').then((m) => m.PartnerModule)
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./pages/contact-us/contact-us.module').then((m) => m.ContactUsModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class ContactModule {}
