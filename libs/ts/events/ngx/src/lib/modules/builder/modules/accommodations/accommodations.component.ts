import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, of, shareReplay, switchMap, take, withLatestFrom } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventAccommodationOption, SpecialEventOption, SpecialEventOptions } from '../../../../interfaces/special-event.interface';

interface AccommodationChoiceGroup {
  label: string;
  choices: Array<EventAccommodationOption>;
}

@Component({
  selector: 'tamu-gisc-accommodations',
  templateUrl: './accommodations.component.html',
  styleUrls: ['./accommodations.component.scss', '../builder-module-base/builder-module-base.component.scss']
})
export class AccommodationsComponent implements OnInit {
  public savedOptionValue: Observable<string | boolean | number | null>;

  public accommodation$: Observable<SpecialEventOption>;
  public nextAccommodation$: Observable<SpecialEventOption | null>;

  private _eventOptions$: BehaviorSubject<SpecialEventOptions>;
  private _accommodationIndex$: Observable<number>;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly angulartics: Angulartics2,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public ngOnInit() {
    this._eventOptions$ = new BehaviorSubject(this.eventSettingsService.eventOptions());

    if (!this._eventOptions$.value || (this._eventOptions$.value as Array<unknown>).length === 0) {
      console.log('No special event options available. Directing to map.');

      this.router.navigate(['map'], { relativeTo: this.route.parent?.parent?.parent });
      return;
    }

    // Test if the route has an accommodation. If it does not, redirect to the first available accommodation.
    const routeAccommodation: Observable<string> = this.route.params.pipe(
      withLatestFrom(this._eventOptions$),
      switchMap(([params, options]) => {
        if (params['accommodation']) {
          return of(params['accommodation']);
        } else {
          const firstAccommodation = Object.values(options)[0];

          return this.router.navigate([firstAccommodation.value], {
            relativeTo: this.route
          });
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

      const hasRet = this.route.snapshot.queryParams['ret'] ?? false;

      if (hasRet) {
        return this.router.navigate(['review'], { relativeTo: this.route.parent?.parent });
      } else {
        if (this.nextAccommodation$) {
          return this.nextAccommodation$.pipe(take(1)).subscribe((res) => {
            if (res === null || res === undefined) {
              return this.router.navigate(['review'], { relativeTo: this.route.parent?.parent });
            }

            // Navigate to the next accommodation in the builder flow
            return this.router.navigate(['accommodations', res?.value], { relativeTo: this.route.parent?.parent });
          });
        } else {
          return this.router.navigate(['review'], { relativeTo: this.route.parent?.parent });
        }
      }
    } else {
      throw new Error('Error saving accommodation selection.');
    }
  };

  public getChoiceGroups(choices: Array<EventAccommodationOption>): Array<AccommodationChoiceGroup> {
    const grouped = choices.reduce((acc, choice) => {
      const key = choice.group || 'Options';

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(choice);

      return acc;
    }, {} as Record<string, Array<EventAccommodationOption>>);

    return Object.entries(grouped).map(([label, groupChoices]) => ({
      label,
      choices: groupChoices
    }));
  }
}
