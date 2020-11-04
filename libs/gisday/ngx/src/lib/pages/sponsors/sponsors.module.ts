import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SponsorsComponent } from './sponsors.component';

const routes: Routes = [
  {
    path: '',
    component: SponsorsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./sponsors-main/sponsors-main.module').then((m) => m.SponsorsMainModule)
      },
      {
        path: 'tamu',
        loadChildren: () => import('./sponsors-tamu/sponsors-tamu.module').then((m) => m.SponsorsTamuModule)
      }
    ]
  }
];

@NgModule({
  declarations: [SponsorsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SponsorsModule {}
