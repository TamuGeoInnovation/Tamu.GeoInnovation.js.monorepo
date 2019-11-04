import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';

import { MapComponent } from '../../components/map/map.component';
import { SubmissionComponent } from '../../components/submission/submission.component';
import { LeaderboardComponent } from '../../components/leaderboard/leaderboard.component';


const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'submission', component: SubmissionComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
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
