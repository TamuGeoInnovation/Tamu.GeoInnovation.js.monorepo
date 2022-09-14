import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'terms-of-use',
    loadChildren: () => import('./pages/terms-of-use/terms-of-use.module').then((m) => m.TermsOfUseModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class AboutModule {}
