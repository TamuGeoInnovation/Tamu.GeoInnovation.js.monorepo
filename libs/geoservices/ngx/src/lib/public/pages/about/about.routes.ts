import { Routes } from '@angular/router';

export const aboutRoutes: Routes = [
  {
    path: 'terms-of-use',
    loadChildren: () => import('./pages/terms-of-use/terms-of-use.routes').then((m) => m.termsOfUseRoutes)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy/privacy-policy.routes').then((m) => m.privacyPolicyRoutes)
  },
  {
    path: 'recurring-billing-policy',
    loadChildren: () =>
      import('./pages/recurring-billing-policy/recurring-billing-policy.routes').then((m) => m.recurringBillingPolicyRoutes)
  },
  {
    path: 'data-security',
    loadChildren: () =>
      import('./pages/data-security-policy/data-security-policy.routes').then((m) => m.dataSecurityPolicyRoutes)
  }
];
