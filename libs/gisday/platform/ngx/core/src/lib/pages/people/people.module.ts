import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PeopleComponent } from './people.component';

const routes: Routes = [
  {
    path: '',
    component: PeopleComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/people-view/people-view.module').then((m) => m.PeopleViewModule)
      },
      {
        path: 'details/:guid',
        loadChildren: () => import('./pages/people-details/people-details.module').then((m) => m.PeopleDetailsModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), PeopleComponent],
  exports: [RouterModule]
})
export class PeopleModule {}
