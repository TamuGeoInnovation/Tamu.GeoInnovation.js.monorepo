import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { SEASON_YEAR_PARAM } from '@tamu-gisc/gisday/platform/ngx/data-access';

/**
 * Holds a past year's pages. The outlet is keyed by year so that moving from one year to another
 * builds the page again instead of reusing it, since the pages read their season when they start.
 */
@Component({
  selector: 'tamu-gisc-seasons',
  template: `@for (year of [year$ | async]; track year) {
    <router-outlet></router-outlet>
  }`,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, AsyncPipe]
})
export class SeasonsComponent {
  public year$ = inject(ActivatedRoute).paramMap.pipe(map((params) => params.get(SEASON_YEAR_PARAM)));
}
