import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

const routes: Routes = [
  { path: 'map', loadChildren: () => import('../map/map.module').then(m => m.MapModule) },
  { path: 'submission', loadChildren: () => import('../submission/submission.module').then(m => m.SubmissionModule) },
  { path: 'leaderboard', loadChildren: () => import('../leaderboard/leaderboard.module').then(m => m.LeaderboardModule) },
];

WebFont.load({
  google: {
    families: ['Material Icons']
  },
  custom: {
    families: ['Moriston', 'Tungsten'],
    urls: ['assets/fonts/moriston_pro/moriston_pro.css', 'assets/fonts/tungsten/tungsten.css']
  }
});


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    ResponsiveModule,
    CommonNgxRouterModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
