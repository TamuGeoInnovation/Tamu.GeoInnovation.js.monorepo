import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'designer',
    loadChildren: () => import('./pages/admin/pages/designer/designer.routes').then((m) => m.designerRoutes)
  },
  {
    path: '',
    loadChildren: () => import('./pages/public/public.routes').then((m) => m.publicRoutes)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  declarations: []
})
export class GisdayCompetitionsNgxCoreModule {}
