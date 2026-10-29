import { Routes } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { DeviceGuard } from '@tamu-gisc/gisday/competitions/ngx/common';

import { PublicComponent } from './public.component';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      // Each page works in a phone's browser, so nobody has to install the app or add it to their home
      // screen first (#2559). Installing it is still suggested, from the submission page.
      {
        path: 'map',
        loadChildren: () => import('./map/map.routes').then((m) => m.mapRoutes),
        canActivate: [AuthGuard]
      },
      {
        path: 'submission',
        loadChildren: () => import('./submission/submission.routes').then((m) => m.submissionRoutes),
        canActivate: [AuthGuard]
      },
      {
        path: 'leaderboard',
        loadChildren: () => import('./leaderboard/leaderboard.routes').then((m) => m.leaderboardRoutes),
        canActivate: [AuthGuard]
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
      // There is no login page: every page that needs a signed-in user is behind Auth0's guard, which
      // sends them to sign in and back. An old /login link falls through to the submission page (#1608).
      { path: '', redirectTo: 'submission', pathMatch: 'full' },
      { path: '**', redirectTo: 'submission' }
    ]
  }
];
