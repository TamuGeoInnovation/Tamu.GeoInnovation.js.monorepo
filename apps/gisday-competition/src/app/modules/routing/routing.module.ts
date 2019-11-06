import { NgModule } from '@angular/core';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', loadChildren: () => import('../map/map.module').then((m) => m.MapModule) },
  { path: 'submission', loadChildren: () => import('../submission/submission.module').then((m) => m.SubmissionModule) },
  { path: 'leaderboard', loadChildren: () => import('../leaderboard/leaderboard.module').then((m) => m.LeaderboardModule) }
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
    CommonNgxRouterModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  exports: [RouterModule]
})
export class AppRoutingModule {}
