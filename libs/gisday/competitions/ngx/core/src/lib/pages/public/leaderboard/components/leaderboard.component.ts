import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { ILeaderboardItem, LeaderboardService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { GISDayRoles } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  public me$: Observable<string>;
  public leaders$: Observable<ILeaderboardItem[]>;
  public roles$: Observable<Array<string>>;
  public userIsManager$: Observable<boolean>;

  constructor(private leaderboardService: LeaderboardService, private settings: SettingsService, private as: AuthService) {}

  public ngOnInit() {
    this.roles$ = this.as.userRoles$;
    this.me$ = this.as.user$.pipe(
      map((u) => {
        if (u) {
          return u.sub;
        } else {
          return null;
        }
      }),
      shareReplay(1)
    );

    this.userIsManager$ = this.roles$.pipe(
      map((rls) => {
        return rls.some((role) => role === GISDayRoles.ADMIN || role === GISDayRoles.MANAGER);
      }),
      distinctUntilChanged(),
      shareReplay()
    );

    this.leaders$ = this.userIsManager$.pipe(
      switchMap((isManager) => {
        if (isManager) {
          return this.leaderboardService.getScoresForActiveAdmin();
        } else {
          return this.leaderboardService.getScoresForActive();
        }
      }),
      shareReplay()
    );
  }
}
