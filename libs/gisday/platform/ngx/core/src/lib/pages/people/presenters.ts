import { ActivatedRouteSnapshot } from '@angular/router';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { matchesText } from '@tamu-gisc/gisday/platform/ngx/common';

/**
 * What the Presenters list and a presenter's own page share (#2919): which presenters there are, their order, and how
 * a search finds them. Moved from the list page unchanged, so both search the same way.
 */

const byName = new Intl.Collator('en', { sensitivity: 'base' });

/** Last name, then first name, without regard to case or accents (#2860). */
export function compareByLastName(a: Partial<Speaker>, b: Partial<Speaker>): number {
  return byName.compare(a.lastName ?? '', b.lastName ?? '') || byName.compare(a.firstName ?? '', b.firstName ?? '');
}

/**
 * Whether the presenter's first name, last name, full name, organization (#2859) or university, by its name or its
 * abbreviation (#2869), contains the search text.
 */
export function matchesSearch(speaker: Partial<Speaker>, search: string): boolean {
  return matchesText(
    [`${speaker.firstName ?? ''} ${speaker.lastName ?? ''}`, speaker.organization?.name, speaker.university?.name, speaker.university?.acronym],
    search
  );
}

/** How many presenters the list holds, said under it: all of them, or how many of them a search shows (#2870). */
export function presenterCount(shown: number, total: number, search: string): string {
  if (search.trim()) {
    return `Showing ${shown} of ${total} presenters`;
  }

  return `${total} ${total === 1 ? 'presenter' : 'presenters'}`;
}

/**
 * The presenters of the season the route is for, by last name: a past year's, or the current year's from its own
 * lookup (#1758).
 */
export function presentersForRoute(
  route: ActivatedRouteSnapshot,
  seasonService: SeasonService,
  speakerService: SpeakerService
): Observable<Array<Partial<Speaker>>> {
  return seasonService.seasonForRoute(route).pipe(
    switchMap(({ season, isPast }) => {
      if (!isPast) {
        return speakerService.getParticipatingPresenters();
      }

      return season ? speakerService.getParticipatingPresentersForSeason(season.guid) : of([]);
    }),
    map((speakers) => [...speakers].sort(compareByLastName)),
    shareReplay(1)
  );
}
