import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, shareReplay, map, of, startWith, switchMap } from 'rxjs';

import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerCardComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

const byName = new Intl.Collator('en', { sensitivity: 'base' });

/** Last name, then first name, without regard to case or accents (#2860). */
export function compareByLastName(a: Partial<Speaker>, b: Partial<Speaker>): number {
  return byName.compare(a.lastName ?? '', b.lastName ?? '') || byName.compare(a.firstName ?? '', b.firstName ?? '');
}

/** Lower case, accents dropped, so "jose" finds "José". */
function folded(text: string): string {
  return (text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Whether the presenter's first name, last name, full name, organization (#2859) or university, by its name or its
 * abbreviation (#2869), contains the search text.
 */
export function matchesSearch(speaker: Partial<Speaker>, search: string): boolean {
  const wanted = folded(search).trim();

  if (!wanted) {
    return true;
  }

  return [
    `${speaker.firstName ?? ''} ${speaker.lastName ?? ''}`,
    speaker.organization?.name,
    speaker.university?.name,
    speaker.university?.acronym
  ].some((field) => folded(field).includes(wanted));
}

/** How many presenters the list holds, said under it: all of them, or how many of them a search shows (#2870). */
export function presenterCount(shown: number, total: number, search: string): string {
  if (search.trim()) {
    return `Showing ${shown} of ${total} presenters`;
  }

  return `${total} ${total === 1 ? 'presenter' : 'presenters'}`;
}

@Component({
  selector: 'tamu-gisc-people-view',
  templateUrl: './people-view.component.html',
  styleUrls: ['./people-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SpeakerCardComponent, TextboxComponent, ReactiveFormsModule, AsyncPipe]
})
export class PeopleViewComponent implements OnInit {
  private speakerService = inject(SpeakerService);
  private seasonService = inject(SeasonService);
  private route = inject(ActivatedRoute);

  public readonly search = new FormControl('', { nonNullable: true });

  /** The season's presenters, by last name. */
  public people$: Observable<Array<Partial<Speaker>>>;

  /** Those that match the search, how many there are in all, and what the page says about that. */
  public view$: Observable<{ shown: Array<Partial<Speaker>>; total: number; count: string }>;

  public ngOnInit() {
    // A past year lists that year's presenters; the current year keeps its own lookup (#1758).
    this.people$ = this.seasonService.seasonForRoute(this.route.snapshot).pipe(
      switchMap(({ season, isPast }) => {
        if (!isPast) {
          return this.speakerService.getParticipatingPresenters();
        }

        return season ? this.speakerService.getParticipatingPresentersForSeason(season.guid) : of([]);
      }),
      map((speakers) => [...speakers].sort(compareByLastName)),
      shareReplay(1)
    );

    this.view$ = combineLatest([this.people$, this.search.valueChanges.pipe(startWith(this.search.value))]).pipe(
      map(([people, search]) => {
        const shown = people.filter((p) => matchesSearch(p, search));

        return { shown, total: people.length, count: presenterCount(shown.length, people.length, search) };
      })
    );
  }
}
