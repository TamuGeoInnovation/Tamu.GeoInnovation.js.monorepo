import { Routes } from '@angular/router';

import { LeaderboardService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { LeaderboardComponent } from './components/leaderboard.component';

const routes: Routes = [
  {
    path: '',
    component: LeaderboardComponent
  }
];

export const leaderboardRoutes: Routes = [{ path: '', providers: [LeaderboardService], children: routes }];
