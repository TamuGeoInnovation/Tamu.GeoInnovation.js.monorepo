import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CreditsComponent } from './credits.component';

const routes: Routes = [
  {
    path: '',
    component: CreditsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'balance'
      },
      {
        path: 'balance',
        loadChildren: () => import('./balance/balance.module').then((m) => m.BalanceModule)
      },
      {
        path: 'refill',
        loadChildren: () => import('./refill/refill.module').then((m) => m.RefillModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [CreditsComponent],
  exports: [RouterModule]
})
export class CreditsModule {}
