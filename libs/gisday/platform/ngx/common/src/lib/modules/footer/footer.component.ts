import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { placesShownOn } from '@tamu-gisc/gisday/common';

import { ActiveSeasonDto, Place } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { PlaceVisibilityOptions } from '../../enums/place-visibility-options.enum';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SeasonLinkPipe } from '../../pipes/season-link/season-link.pipe';
import { GISDAY_SITE, SiteHasPipe } from '../../site/site';

@Component({
  selector: 'tamu-gisc-app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SiteHasPipe, RouterLink, AsyncPipe, SeasonLinkPipe]
})
export class FooterComponent implements OnInit {
  public readonly site = inject(GISDAY_SITE);
  private readonly ss = inject(SeasonService);
  private readonly os = inject(PlaceService);

  public activeSeason$: Observable<ActiveSeasonDto | null>;
  public viewedYear$: Observable<number | null>;
  public pastYears$: Observable<Array<number>>;
  public organizations$: Observable<Array<Partial<Place>>>;
  public currentYear: number;

  public ngOnInit(): void {
    // The year being looked at (#1758). Partners stay the current year's.
    this.activeSeason$ = this.ss.viewedSeason$;
    this.viewedYear$ = this.ss.viewedYear$;
    this.currentYear = new Date().getFullYear();
    this.pastYears$ = combineLatest([this.ss.seasons$, this.ss.activeSeason$]).pipe(
      map(([seasons, active]) => {
        const current = active?.year;

        // With no active season there is no current year for a year to be before.
        if (current === undefined) {
          return [];
        }

        return seasons
          .flatMap((season) => (season.year !== undefined && season.year < current ? [season.year] : []))
          .sort((a, b) => b - a);
      })
    );
    this.organizations$ = this.ss.activeSeason$.pipe(
      switchMap(() => {
        return this.os
          .getEntitiesForActiveSeason()
          .pipe(map((places) => placesShownOn(this.site, places, PlaceVisibilityOptions.Footer)));
      })
    );
  }
}
