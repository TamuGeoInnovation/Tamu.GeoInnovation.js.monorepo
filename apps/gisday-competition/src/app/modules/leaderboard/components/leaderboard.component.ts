import { Component, OnInit } from '@angular/core';
import { LeaderboardService, LeaderboardItem } from '../providers/leaderboard.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  public leaders$: Observable<LeaderboardItem[]>;
  constructor(
    private readonly leaderboardService: LeaderboardService
  ) { }

  ngOnInit() {
    this.leaders$ = this.leaderboardService.generateFakeData(5000);
  }

}
