import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'terms-of-use',
    loadChildren: () => import('./pages/terms-of-use/terms-of-use.module').then((m) => m.TermsOfUseModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyModule)
  },
  {
    path: 'data-security',
    loadChildren: () =>
      import('./pages/data-security-policy/data-security-policy.module').then((m) => m.DataSecurityPolicyModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class AboutModule {}
