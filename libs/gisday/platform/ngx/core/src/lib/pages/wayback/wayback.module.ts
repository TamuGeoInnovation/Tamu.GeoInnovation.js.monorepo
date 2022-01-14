import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { WaybackComponent } from './wayback.component';

const routes: Routes = [
  {
    path: '',
    component: WaybackComponent,
    children: [
      {
        path: '2019',
        loadChildren: () => import('./wayback-2019/wayback-2019.module').then((m) => m.Wayback2019Module)
      }
    ]
  }
];

@NgModule({
  declarations: [WaybackComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaybackModule {}
