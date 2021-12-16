import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck, shareReplay } from 'rxjs/operators';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ILeaderboardItem, LeaderboardService } from '../../../../modules/data-access/leaderboard/leaderboard.service';

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
    private environment: EnvironmentService
  ) {}

  public ngOnInit() {
    this.leaders$ = this.leaderboardService.getScores();
    this.me$ = this.settings
      .getSimpleSettingsBranch(this.environment.value('LocalStoreSettings').subKey)
      .pipe(pluck<object, string>('guid'), shareReplay(1));
  }
}
