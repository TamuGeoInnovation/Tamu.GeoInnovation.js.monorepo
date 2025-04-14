import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'complete',
    loadChildren: () => import('./pages/complete/complete.module').then((m) => m.CompleteModule)
  },
  {
    path: 'cancel',
    loadChildren: () => import('./pages/cancel/cancel.module').then((m) => m.CancelModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./pages/error/error.module').then((m) => m.ErrorModule)
  },
  {
    path: '**',
    redirectTo: 'error'
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: []
})
export class OrderModule {}
