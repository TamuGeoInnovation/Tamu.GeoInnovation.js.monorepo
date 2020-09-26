import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PresentersComponent } from './presenters.component';

const routes: Routes = [
  {
    path: '',
    component: PresentersComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/presenters-view/presenters-view.module').then((m) => m.PresentersViewModule)
      },
      {
        path: 'details/:guid',
        loadChildren: () =>
          import('./pages/presenter-details/presenter-details.module').then((m) => m.PresenterDetailsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [PresentersComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentersModule {}
