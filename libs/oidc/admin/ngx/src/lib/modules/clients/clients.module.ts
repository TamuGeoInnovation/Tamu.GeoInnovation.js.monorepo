import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ClientsComponent } from './clients.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/view-client/view-client.module').then((m) => m.ViewClientModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ClientsComponent],
  exports: [RouterModule]
})
export class ClientsModule {}
