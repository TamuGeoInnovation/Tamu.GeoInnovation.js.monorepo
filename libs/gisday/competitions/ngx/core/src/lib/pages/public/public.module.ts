import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { UINavigationMobileTabModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';
import { DeviceGuard } from '@tamu-gisc/gisday/competitions/ngx/common';

import { PublicComponent } from './public.component';

const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      {
        path: 'map',
        loadChildren: () => import('./map/map.module').then((m) => m.MapModule),
        canActivate: [DeviceGuard, AuthGuard],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'submission',
        loadChildren: () => import('./submission/submission.module').then((m) => m.SubmissionModule),
        canActivate: [DeviceGuard, AuthGuard],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'leaderboard',
        loadChildren: () => import('./leaderboard/leaderboard.module').then((m) => m.LeaderboardModule),
        canActivate: [DeviceGuard, AuthGuard],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'login',
        loadChildren: () => import('./login/login.module').then((m) => m.LoginModule),
        canActivate: [],
        data: {
          deviceModes: ['standalone'],
          deviceFailRedirect: 'app/install'
        }
      },
      {
        path: 'install',
        loadChildren: () => import('./install/install.module').then((m) => m.InstallModule),
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

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UINavigationMobileTabModule],
  declarations: [PublicComponent]
})
export class PublicModule {}
