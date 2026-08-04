import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import {
  EventConfiguration,
  EventSettings,
  ResolvedEventSettings,
  SpecialEventOptions
} from '../../../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss', '../builder-module-base/builder-module-base.component.scss']
})
export class ReviewComponent implements OnInit {
  public eventOptions: BehaviorSubject<SpecialEventOptions>;
  public settings: Observable<EventSettings>;
  public mergedSettings: ResolvedEventSettings;
  public settingsValid = false;
  public configuration: EventConfiguration | null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly eventSettingsService: EventSettingsService,
    private readonly angulartics: Angulartics2
  ) {}

  public ngOnInit() {
    this.eventOptions = new BehaviorSubject(this.eventSettingsService.eventOptions());
    this.settings = this.eventSettingsService.settings(true).pipe(shareReplay(1));
    this.mergedSettings = this.eventSettingsService.getMergedSettings();
    this.settingsValid = this.eventSettingsService.accommodationsValid();
    this.configuration = this.eventSettingsService.eventConfiguration()?.configuration ?? null;
  }

  public goToAccommodationSelection(optionKey: string) {
    this.angulartics.eventTrack.next({
      action: 'navigate',
      properties: {
        category: 'builder',
        gstCustom: {
          origin: 'review',
          dest: `accommodations/${optionKey}`
        }
      }
    });

    this.router.navigate(['accommodations', optionKey], {
      relativeTo: this.route.parent?.parent,
      queryParams: { ret: 'review' }
    });
  }

  public navigateToMap() {
    this.angulartics.eventTrack.next({
      action: 'navigate',
      properties: {
        category: 'builder',
        gstCustom: {
          origin: 'review',
          dest: 'map'
        }
      }
    });

    this.router.navigate(['map'], { relativeTo: this.route.parent?.parent?.parent });
  }
}
