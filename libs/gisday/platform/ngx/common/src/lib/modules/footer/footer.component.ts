import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { combineLatest, filter, map, mergeMap, Observable, switchMap, toArray } from 'rxjs';

import { Place, Season } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { PlaceVisibilityOptions } from '../../enums/place-visibility-options.enum';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SeasonLinkPipe } from '../../pipes/season-link/season-link.pipe';

@Component({
  selector: 'tamu-gisc-app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, AsyncPipe, SeasonLinkPipe]
})
export class FooterComponent implements OnInit {
  private readonly ss = inject(SeasonService);
  private readonly os = inject(PlaceService);

  public activeSeason$: Observable<Partial<Season>>;
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
      map(([seasons, active]) =>
        seasons
          .map((season) => season.year)
          .filter((year) => year < active.year)
          .sort((a, b) => b - a)
      )
    );
    this.organizations$ = this.ss.activeSeason$.pipe(
      switchMap(() => {
        return this.os.getEntitiesForActiveSeason().pipe(
          mergeMap((places) => places),
          filter((place) => place?.visibilitySettings && place.visibilitySettings.includes(PlaceVisibilityOptions.Footer)),
          toArray()
        );
      })
    );
  }
}
