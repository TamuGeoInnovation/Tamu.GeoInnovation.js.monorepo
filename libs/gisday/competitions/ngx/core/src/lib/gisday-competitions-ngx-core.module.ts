import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'designer',
    loadChildren: () => import('./pages/admin/pages/designer/designer.module').then((m) => m.DesignerModule)
  },
  {
    path: 'viewer',
    loadChildren: () => import('./pages/admin/pages/viewer/viewer.module').then((m) => m.ViewerModule)
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
