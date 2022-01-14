import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthService, AuthGuard } from '@tamu-gisc/gisday/competitions/ngx/common';

const routes: Routes = [
  {
    path: 'designer',
    loadChildren: () => import('./pages/admin/pages/designer/designer.module').then((m) => m.DesignerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'viewer',
    loadChildren: () => import('./pages/admin/pages/viewer/viewer.module').then((m) => m.ViewerModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadChildren: () => import('./pages/public/public.module').then((m) => m.PublicModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  declarations: [],
  providers: [AuthService]
})
export class GisdayCompetitionsNgxCoreModule {}
