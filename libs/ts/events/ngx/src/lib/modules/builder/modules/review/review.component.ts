import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventSettings } from '../../../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public settings: EventSettings;
  public settingsValid = false;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private eventSettingsService: EventSettingsService,
    private angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    this.settings = this.eventSettingsService.settings;
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
