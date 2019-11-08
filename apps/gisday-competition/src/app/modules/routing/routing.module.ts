import { NgModule } from '@angular/core';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';

import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import { AuthGuard } from './guards/auth.guard';
import { AuthService } from '../auth/services/auth.service';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  {
    path: 'map',
    canActivate: [AuthGuard],
    loadChildren: () => import('../map/map.module').then((m) => m.MapModule)
  },
  {
    path: 'submission',
    loadChildren: () => import('../submission/submission.module').then((m) => m.SubmissionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'leaderboard',
    loadChildren: () => import('../leaderboard/leaderboard.module').then((m) => m.LeaderboardModule),
    canActivate: [AuthGuard]
  },
  { path: 'login', loadChildren: () => import('../login/login.module').then((m) => m.LoginModule) }
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
    RouterModule.forRoot(routes),
    HttpClientModule,
    BrowserAnimationsModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    SettingsModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, AuthGuard, AuthService],
  exports: [RouterModule]
})
export class AppRoutingModule {}
