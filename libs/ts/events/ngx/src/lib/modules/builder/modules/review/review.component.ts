import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { FootballSettings, GAMEDAY_EVENT_NAMES, SHOWDOWN_EVENT } from '../../../../interfaces/football.interface';
import { GameDaySettingsService } from '../../../map/services/settings/game-day-settings.service';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public settings: FootballSettings;
  public settingsValid = false;
  public eventName: SHOWDOWN_EVENT;
  public eventNames = GAMEDAY_EVENT_NAMES;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private eventSettingsService: GameDaySettingsService,
    private angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    this.settings = this.eventSettingsService.settings;
    this.eventName = this.eventSettingsService.savedEventType;

    if (this.settings !== undefined) {
      this.settingsValid = this.settings.event !== undefined;
    }
  }

  public next = (route: string, params?: { ret: string }) => {
    this.angulartics.eventTrack.next({
      action: 'navigate',
      properties: {
        category: 'builder',
        gstCustom: {
          origin: 'review',
          dest: route
        }
      }
    });

    if (route && params) {
      this.router.navigate([`${route}`], { queryParams: { ...params } });
    } else if (route && !params) {
      this.router.navigate([`${route}`]);
    }
  };
}
