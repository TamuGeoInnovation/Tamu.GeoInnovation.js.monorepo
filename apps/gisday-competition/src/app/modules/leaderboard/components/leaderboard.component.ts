import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { LeaderboardService, ILeaderboardItem } from '../providers/leaderboard.service';

@Component({
  selector: 'tamu-gisc-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  public leaders$: Observable<ILeaderboardItem[]>;

  constructor(private readonly leaderboardService: LeaderboardService) {}

  public ngOnInit() {
    this.leaders$ = this.leaderboardService.getScores();
  }
}
