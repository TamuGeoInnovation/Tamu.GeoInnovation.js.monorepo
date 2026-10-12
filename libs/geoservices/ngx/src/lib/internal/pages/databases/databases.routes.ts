import { Routes } from '@angular/router';

import { DatabasesComponent } from './databases.component';

export const databasesRoutes: Routes = [
  {
    path: '',
    component: DatabasesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'existing'
      },
      {
        path: 'existing',
        loadChildren: () => import('./uploaded/uploaded.routes').then((m) => m.uploadedRoutes)
      },
      {
        path: 'upload',
        loadChildren: () => import('./upload/upload.routes').then((m) => m.uploadRoutes)
      },
      {
        path: 'share',
        loadChildren: () => import('./share/share.routes').then((m) => m.shareRoutes)
      }
    ]
  }
];
