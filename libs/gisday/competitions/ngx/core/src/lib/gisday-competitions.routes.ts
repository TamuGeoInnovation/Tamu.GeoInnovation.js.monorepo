import { Routes } from '@angular/router';

export const gisdayCompetitionsRoutes: Routes = [
  {
    path: 'designer',
    loadChildren: () => import('./pages/admin/pages/designer/designer.routes').then((m) => m.designerRoutes)
  },
  {
    path: '',
    loadChildren: () => import('./pages/public/public.routes').then((m) => m.publicRoutes)
  }
];
