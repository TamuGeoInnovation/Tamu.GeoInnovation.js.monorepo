import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'designer',
    loadChildren: () => import('./pages/admin/pages/designer/designer.module').then((m) => m.DesignerModule)
  },
  {
    path: '',
    loadChildren: () => import('./pages/public/public.module').then((m) => m.PublicModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  declarations: []
})
export class GisdayCompetitionsNgxCoreModule {}
