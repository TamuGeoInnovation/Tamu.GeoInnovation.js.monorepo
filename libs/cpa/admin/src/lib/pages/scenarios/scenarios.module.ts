import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/list/list.module').then((m) => m.ScenarioListModule),
  },
  {
    path: 'create',
    loadChildren: () => import('./pages/edit/edit.module').then((m) => m.ScenarioEditModule),
  },
  {
    path: 'edit',
    loadChildren: () => import('./pages/edit/edit.module').then((m) => m.ScenarioEditModule),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [],
})
export class ScenariosModule {}
