import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { WorkshopsComponent } from './workshops.component';

const routes: Routes = [
  {
    path: '',
    component: WorkshopsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./pages/workshops-list/workshops-list.module').then((m) => m.WorkshopsListModule)
      },
      {
        path: 'edit/:guid',
        loadChildren: () => import('./pages/workshop-builder/workshop-builder.module').then((m) => m.WorkshopBuilderModule),
        data: {
          title: 'Edit Workshop'
        }
      },
      {
        path: 'create',
        loadChildren: () => import('./pages/workshop-builder/workshop-builder.module').then((m) => m.WorkshopBuilderModule),
        data: {
          title: 'Create Workshop'
        }
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [WorkshopsComponent]
})
export class WorkshopsModule {}
