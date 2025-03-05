import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, shareReplay } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventSettings, ResolvedEventSettings, SpecialEventOptions } from '../../../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public eventOptions: BehaviorSubject<Array<SpecialEventOptions>>;
  public settings: EventSettings;
  public mergedSettings: ResolvedEventSettings;
  public settingsValid = false;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private eventSettingsService: EventSettingsService,
    private angulartics: Angulartics2,
    private env: EnvironmentService
  ) {}

  public ngOnInit() {
    this.eventOptions = new BehaviorSubject(this.eventSettingsService.eventOptions());
    this.settings = this.eventSettingsService.settings(true).pipe(shareReplay(1));
    this.mergedSettings = this.eventSettingsService.getMergedSettings();
    this.settingsValid = this.eventSettingsService.accommodationsValid();
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
