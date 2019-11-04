import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaderboardComponent } from '../../components/leaderboard/leaderboard.component';

@NgModule({
  declarations: [LeaderboardComponent],
  exports: [LeaderboardComponent],
  imports: [
    CommonModule
  ]
})
export class LeaderboardModule { }
