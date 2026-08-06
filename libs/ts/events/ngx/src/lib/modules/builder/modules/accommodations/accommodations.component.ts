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
  public config = this.eventSettingsService.eventConfiguration()?.configuration;
  public savedOptionValue: Observable<string | boolean | number | null>;

  public accommodation$: Observable<SpecialEventOption>;

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
          // Land on the first option that is actually visible for the current settings so conditional
          // flows never open on a step that should be skipped.
          const settings = this.eventSettingsService.settings();
          const firstAccommodation =
            Object.values(options).find((option) => this.eventSettingsService.isOptionVisible(option, settings)) ??
            Object.values(options)[0];

          return this.router.navigate([firstAccommodation.value], {
            relativeTo: this.route,
            replaceUrl: true
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
        // Determine the next step after the option just saved. Settings are read fresh (post-save) so a
        // gating selection is reflected when deciding which conditional steps remain visible.
        return this._accommodationIndex$.pipe(take(1)).subscribe((index) => {
          const options = this._eventOptions$.value;
          const settings = this.eventSettingsService.settings();

          const nextAccommodation = options
            .slice(index + 1)
            .find((option) => this.eventSettingsService.isOptionVisible(option, settings));

          if (!nextAccommodation) {
            return this.router.navigate(['review'], { relativeTo: this.route.parent?.parent });
          }

          // Navigate to the next visible accommodation in the builder flow
          return this.router.navigate(['accommodations', nextAccommodation.value], {
            relativeTo: this.route.parent?.parent
          });
        });
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
