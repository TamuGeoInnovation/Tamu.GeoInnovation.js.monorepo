import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { EditComponent } from './edit.component';

const routes: Routes = [
  {
    path: ':guid/delete',
    component: EditComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/delete/delete.module').then((m) => m.DeleteModule)
      }
    ]
  },
  {
    path: ':guid',
    component: EditComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/details/details.module').then((m) => m.DetailsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [EditComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class ScenarioEditModule {}
