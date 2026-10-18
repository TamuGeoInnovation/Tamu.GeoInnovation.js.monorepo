import { Routes } from '@angular/router';

export const contactRoutes: Routes = [
  {
    path: 'address-correction',
    loadChildren: () => import('./pages/address-correction/address-correction.routes').then((m) => m.addressCorrectionRoutes)
  },
  {
    path: 'bug-report',
    loadChildren: () => import('./pages/bug-report/bug-report.routes').then((m) => m.bugReportRoutes)
  },
  // {
  //   path: 'partnership',
  //   loadChildren: () => import('./pages/partner/partner.routes').then((m) => m.partnerRoutes)
  // },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./pages/contact-us/contact-us.routes').then((m) => m.contactUsRoutes)
  }
];
