import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, of, shareReplay, switchMap, take, withLatestFrom } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { SpecialEventOptions } from '../../../../interfaces/special-event.interface';

@Component({
  selector: 'tamu-gisc-accommodations',
  templateUrl: './accommodations.component.html',
  styleUrls: ['./accommodations.component.scss']
})
export class AccommodationsComponent implements OnInit {
  public savedOptionValue: Observable<string | boolean | number | null>;
  private _eventOptions$: BehaviorSubject<Array<SpecialEventOptions>>;
  private _accommodationIndex$: Observable<number>;
  public accommodation$: Observable<SpecialEventOptions>;
  public nextAccommodation$: Observable<SpecialEventOptions | null>;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public ngOnInit() {
    this._eventOptions$ = new BehaviorSubject(this.eventSettingsService.eventOptions());

    if (!this._eventOptions$.value) {
      console.log('No special event options available. Directing to map.');

      this.router.navigate(['map']);
    }

    // Test if the route has an accommodation. If it does not, redirect to the first available accommodation.
    const routeAccommodation: Observable<string> = this.route.params.pipe(
      withLatestFrom(this._eventOptions$),
      switchMap(([params, options]) => {
        if (params['accommodation']) {
          return of(params['accommodation']);
        } else {
          const firstAccommodation = Object.values(options)[0];

          return this.router.navigate(['builder/accommodations', firstAccommodation.value]);
        }
      }),
      shareReplay(1)
    );

    this._accommodationIndex$ = routeAccommodation.pipe(
      withLatestFrom(this._eventOptions$),
      map(([accommodation, options]) => {
        return Object.values(options).findIndex((option) => option.value === accommodation);
      }),
      shareReplay(1)
    );

    this.accommodation$ = combineLatest([this._eventOptions$, this._accommodationIndex$]).pipe(
      map(([options, index]) => {
        return options[index];
      }),
      shareReplay(1)
    );

    this.nextAccommodation$ = combineLatest([this._eventOptions$, this._accommodationIndex$]).pipe(
      map(([options, index]) => {
        if (index < options.length - 1) {
          return options[index + 1];
        } else {
          return null;
        }
      }),
      shareReplay(1)
    );

    this.savedOptionValue = routeAccommodation.pipe(
      map((accommodation) => this.eventSettingsService.getSavedAccommodation(accommodation)),
      shareReplay(1)
    );
  }

  /**
   * Saves component value in local storage
   */
  public saveOption = (optionName: string, optionValue: string | boolean | number) => {
    const confirm = this.eventSettingsService.saveAccommodation(optionName, optionValue);

    if (confirm !== undefined) {
      this.angulartics.eventTrack.next({
        action: 'settings_set',
        properties: {
          category: optionName,
          gstCustom: {
            event_value: `${optionValue}`
          }
        }
      });

      const hasRet = this.route.snapshot.queryParams['ret'];

      if (hasRet !== undefined) {
        return this.router.navigate([`builder/${hasRet}`]);
      } else {
        if (this.nextAccommodation$) {
          return this.nextAccommodation$.pipe(take(1)).subscribe((res) => {
            if (res === null || res === undefined) {
              return this.router.navigate(['builder/review']);
            }

            return this.router.navigate(['builder/accommodations', res?.value]);
          });
        } else {
          return this.router.navigate(['builder/review']);
        }
      }
    } else {
      throw new Error('Error saving accommodation selection.');
    }
  };
}
