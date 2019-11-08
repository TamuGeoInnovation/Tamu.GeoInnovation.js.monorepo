import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LeaderboardComponent } from './components/leaderboard.component';
import { LeaderboardService } from './providers/leaderboard.service';

const routes: Routes = [
  {
    path: '',
    component: LeaderboardComponent
  }
];

@NgModule({
  declarations: [LeaderboardComponent],
  exports: [LeaderboardComponent],
  imports: [RouterModule.forChild(routes), CommonModule],
  providers: [LeaderboardService]
})
export class LeaderboardModule {}
