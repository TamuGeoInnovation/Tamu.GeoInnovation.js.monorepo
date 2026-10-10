import { Routes } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { DeviceGuard } from '@tamu-gisc/gisday/competitions/ngx/common';

import { PublicComponent } from './public.component';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      {
        path: 'map',
        loadChildren: () => import('./map/map.routes').then((m) => m.mapRoutes),
        canActivate: [DeviceGuard, AuthGuard],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'submission',
        loadChildren: () => import('./submission/submission.routes').then((m) => m.submissionRoutes),
        canActivate: [DeviceGuard, AuthGuard],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'leaderboard',
        loadChildren: () => import('./leaderboard/leaderboard.routes').then((m) => m.leaderboardRoutes),
        canActivate: [DeviceGuard, AuthGuard],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'login',
        loadChildren: () => import('./login/login.routes').then((m) => m.loginRoutes),
        canActivate: [],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'install',
        loadChildren: () => import('./install/install.routes').then((m) => m.installRoutes),
        canActivate: [DeviceGuard],
        data: {
          deviceModes: ['standalone'],
          devicePassRedirect: '/',
          deviceIgnoreFailRedirect: true
        }
      },
      { path: '', redirectTo: 'submission', pathMatch: 'full' },
      { path: '**', redirectTo: 'submission' }
    ]
  }
];
