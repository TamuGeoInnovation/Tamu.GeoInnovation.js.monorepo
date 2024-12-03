import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { SHOWDOWN_EVENT } from '../../../../interfaces/football.interface';
import { GameDaySettingsService } from '../../../map/services/settings/game-day-settings.service';

@Component({
  selector: 'tamu-gisc-event-select',
  templateUrl: './event-select.component.html',
  styleUrls: ['./event-select.component.scss']
})
export class EventSelectComponent implements OnInit {
  public event: SHOWDOWN_EVENT;

  public eventTypes = SHOWDOWN_EVENT;

  private _refresh$: Subject<void> = new Subject();

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly eventSettingsService: GameDaySettingsService
  ) {}

  public ngOnInit() {
    this.event = this.eventSettingsService.savedEventType;
  }

  /**
   * Saves component value in local storage
   */
  public saveEvent = (item: SHOWDOWN_EVENT) => {
    const saved = this.eventSettingsService.saveEventType(item);

    if (saved != undefined) {
      this.angulartics.eventTrack.next({
        action: 'settings_set',
        properties: {
          category: 'event',
          gstCustom: {
            event_value: item
          }
        }
      });

      this._refresh$.next();

      const hasRet = this.route.snapshot.queryParams['ret'];

      if (hasRet !== undefined) {
        this.router.navigate([`builder/${hasRet}`]);
      } else {
        this.router.navigate(['map']);
      }
    } else {
      throw new Error('Failed to save event selection.');
    }
  };
}
