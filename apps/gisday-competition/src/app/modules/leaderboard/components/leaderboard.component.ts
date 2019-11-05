import { Component, OnInit } from '@angular/core';
import { Observable, from, of } from 'rxjs';

import { LeaderboardService, LeaderboardItem } from '../providers/leaderboard.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  public leaders$: Observable<LeaderboardItem[]>;
  constructor(private readonly leaderboardService: LeaderboardService) {}

  public ngOnInit() {
    this.leaders$ = this.leaderboardService.generateFakeData(30).pipe(
      switchMap((list) => {
        return of(
          list.sort((a, b) => {
            return b.points - a.points;
          })
        );
      })
    );
  }
}
