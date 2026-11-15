import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { runsCompetition } from '@tamu-gisc/gisday/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class LandingComponent {
  private readonly season = toSignal(inject(SeasonService).getActiveSeason());

  /**
   * Whether the active season runs a research competition, so its block shows only in a year it runs (#2948). Every
   * one shows until the season is read, as when none is set.
   */
  public runs(competition: string): boolean {
    return runsCompetition(this.season(), competition);
  }
}
