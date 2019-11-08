import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { LeaderboardService, ILeaderboardItem } from '../providers/leaderboard.service';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { pluck, shareReplay } from 'rxjs/operators';

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
    this.me$ = this.settings.getSimpleSettingsBranch(this.environment.value('LocalStoreSettings').subKey).pipe(
      pluck<object, string>('guid'),
      shareReplay(1)
    );
  }
}
