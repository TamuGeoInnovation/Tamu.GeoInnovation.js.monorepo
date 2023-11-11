import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { ILeaderboardItem, LeaderboardService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'tamu-gisc-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  public leaders$: Observable<ILeaderboardItem[]>;
  public me$: Observable<string>;

  constructor(
    private leaderboardService: LeaderboardService,
    private settings: SettingsService,
    private authService: AuthService
  ) {}

  public ngOnInit() {
    this.leaders$ = this.leaderboardService.getScoresForActive().pipe(shareReplay());
    this.me$ = this.authService.user$.pipe(
      map((u) => {
        if (u) {
          return u.sub;
        } else {
          return null;
        }
      }),
      shareReplay(1)
    );
  }
}
