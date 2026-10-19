import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable, filter, map, mergeMap, of, pipe, shareReplay, switchMap, toArray } from 'rxjs';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AssetUrlPipe, activeSponsors } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-sponsors-main',
  templateUrl: './sponsors-main.component.html',
  styleUrls: ['./sponsors-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, AsyncPipe, AssetUrlPipe]
})
export class SponsorsMainComponent implements OnInit {
  private readonly ss = inject(SponsorService);
  private readonly seasons = inject(SeasonService);
  private readonly route = inject(ActivatedRoute);

  public isPastSeason$: Observable<boolean>;

  private _sponsors$: Observable<Array<Partial<Sponsor>>>;
  public rasterSponsors$: Observable<Array<Partial<Sponsor>>>;
  public polygonSponsors$: Observable<Array<Partial<Sponsor>>>;
  public lineSponsors$: Observable<Array<Partial<Sponsor>>>;
  public pointSponsors$: Observable<Array<Partial<Sponsor>>>;

  public ngOnInit(): void {
    // A past year shows that year's sponsors; the current year keeps its own lookup (#1758).
    const viewed = this.seasons.seasonForRoute(this.route.snapshot).pipe(shareReplay(1));

    this.isPastSeason$ = viewed.pipe(map(({ isPast }) => isPast));
    this._sponsors$ = viewed.pipe(
      switchMap(({ season, isPast }) => {
        if (!isPast) {
          return this.ss.getEntitiesForActiveSeason();
        }

        return season ? this.ss.getEntitiesForSeason(season.guid) : of([]);
      }),
      shareReplay(1)
    );
    this.rasterSponsors$ = this._sponsors$.pipe(this.filterSponsors('raster'));
    this.polygonSponsors$ = this._sponsors$.pipe(this.filterSponsors('polygon'));
    this.lineSponsors$ = this._sponsors$.pipe(this.filterSponsors('line'));
    this.pointSponsors$ = this._sponsors$.pipe(this.filterSponsors('point'));
  }

  public filterSponsors(type: Sponsor['sponsorshipLevel']) {
    return pipe(
      mergeMap((sponsors: Array<Partial<Sponsor>>) => sponsors),
      filter((s) => {
        return s.sponsorshipLevel === type;
      }),
      toArray()
    );
  }
}
