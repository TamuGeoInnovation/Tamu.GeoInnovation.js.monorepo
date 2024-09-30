import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { RingDaySettings } from '../../../../interfaces/ring-day.interface';
import { RingDaySettingsService } from '../../../map/services/settings/ring-day-settings.service';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  public settings: RingDaySettings;
  public settingsValid = false;
  public eventDate: Date;

  constructor(
    private store: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private move: RingDaySettingsService,
    private angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    this.settings = this.store.getStorage<RingDaySettings>({ primaryKey: 'ring-day-settings' });

    if (this.settings !== undefined) {
      this.settingsValid = this.settings.date !== undefined && this.settings.accessible !== undefined;

      if (this.settingsValid) {
        const d = this.move.getDateForDay(this.settings.date);

        if (d) {
          this.eventDate = new Date(new Date().getFullYear(), d.month - 1, d.day);
        }
      }
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
