import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';

import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import { DeviceGuard } from './guards/device.guard';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from '../auth/services/auth.service';

const routes: Routes = [
  { path: '', redirectTo: '/submission', pathMatch: 'full' },
  {
    path: 'map',
    loadChildren: () => import('../../pages/map/map.module').then((m) => m.MapModule),
    canActivate: [DeviceGuard, AuthGuard],
    data: {
      deviceModes: ['standalone'],
      deviceFailRedirect: '/install'
    }
  },
  {
    path: 'submission',
    loadChildren: () => import('../../pages/submission/submission.module').then((m) => m.SubmissionModule),
    canActivate: [DeviceGuard, AuthGuard],
    data: {
      deviceModes: ['standalone'],
      deviceFailRedirect: '/install'
    }
  },
  {
    path: 'leaderboard',
    loadChildren: () => import('../../pages/leaderboard/leaderboard.module').then((m) => m.LeaderboardModule),
    canActivate: [DeviceGuard, AuthGuard],
    data: {
      deviceModes: ['standalone'],
      deviceFailRedirect: '/install'
    }
  },
  {
    path: 'login',
    loadChildren: () => import('../../pages/login/login.module').then((m) => m.LoginModule),
    canActivate: [DeviceGuard],
    data: {
      deviceModes: ['standalone'],
      deviceFailRedirect: '/install'
    }
  },
  {
    path: 'install',
    loadChildren: () => import('../../pages/install/install.module').then((m) => m.InstallModule),
    canActivate: [DeviceGuard],
    data: {
      deviceModes: ['standalone'],
      devicePassRedirect: '/',
      deviceIgnoreFailRedirect: true
    }
  }
];

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:300,400,600', 'Oswald:300,400']
  }
});

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    BrowserAnimationsModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    SettingsModule
  ],
  providers: [AuthService],
  exports: [RouterModule]
})
export class AppRoutingModule {}
