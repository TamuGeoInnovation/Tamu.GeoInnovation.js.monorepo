import { ChangeDetectionStrategy, Component, Injectable, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import {
  ReviewEmailSession,
  SeasonCompetitions,
  awardsSession,
  competitionSession,
  sessionDay,
  sessionPlace,
  sessionHours,
  siteListsSession
} from '@tamu-gisc/gisday/common';
import { EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

/** Which of the season's sessions a competition page names (#3011). */
export type CompetitionSessionKind = 'poster' | 'undergraduate' | 'graduate' | 'awards';

/**
 * The active season's sessions this site lists, read once for every competition page (#3011). Null while they load,
 * an empty list if they cannot be read.
 */
@Injectable({ providedIn: 'root' })
export class CompetitionSessionsService {
  private readonly events = inject(EventService);
  private readonly site = inject(GISDAY_SITE);

  public readonly sessions$: Observable<Array<ReviewEmailSession>> = this.events.getEntitiesForActiveSeason().pipe(
    map((events) =>
      (events as Array<Parameters<typeof siteListsSession>[1] & ReviewEmailSession & { active?: boolean }>).filter(
        (event) => event.active !== false && siteListsSession(this.site, event)
      )
    ),
    catchError(() => of([])),
    shareReplay(1)
  );
}

/**
 * The session of a kind among the season's, found as the acceptance emails find it (#3011): the one the season chose
 * in Admin (#3019), else by its name. Awards are a competition's own when `competition` names it.
 */
export function sessionOfKind(
  sessions: Array<ReviewEmailSession> | null,
  kind: CompetitionSessionKind,
  season?: SeasonCompetitions | null,
  competition?: 'poster' | 'presentation'
): ReviewEmailSession | null {
  if (kind === 'awards') {
    return awardsSession(sessions, season, competition) ?? null;
  }

  return (
    (kind === 'poster'
      ? competitionSession(sessions, 'poster', null, season)
      : competitionSession(sessions, 'presentation', kind, season)) ?? null
  );
}

/**
 * The day the sessions of these kinds are on, as a page heading gives it: "Tuesday, November 17, 2026", or both days
 * when they differ. Empty while none is found (#3019).
 */
export function competitionDays(
  sessions: Array<ReviewEmailSession> | null,
  kinds: Array<CompetitionSessionKind>,
  season?: SeasonCompetitions | null
): string {
  const days = kinds
    .map((kind) => sessionOfKind(sessions, kind, season))
    .filter((session): session is ReviewEmailSession => Boolean(session))
    .map((session) => sessionDay(session, 'long'))
    .filter(Boolean);

  return [...new Set(days)].join(' and ');
}

/**
 * A competition's session as the database has it (#3011): its name linked to its page, day, time and room. The pages
 * used to type these in, and went stale when a session moved.
 */
@Component({
  selector: 'tamu-gisc-competition-session',
  templateUrl: './competition-session.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class CompetitionSessionComponent {
  public readonly kind = input.required<CompetitionSessionKind>();

  private readonly sessions = toSignal(inject(CompetitionSessionsService).sessions$, { initialValue: null });

  public readonly loaded = computed(() => this.sessions() !== null);

  /** The season, for the sessions it chose (#3019); without it, the sessions are found by name. */
  public readonly season = input<SeasonCompetitions | null>(null);
  /** Whose awards session, on a competition's page (#3019). */
  public readonly competition = input<'poster' | 'presentation' | undefined>(undefined);

  public readonly session = computed(() => sessionOfKind(this.sessions(), this.kind(), this.season(), this.competition()));

  public readonly day = computed(() => (this.session() ? sessionDay(this.session(), 'long') : ''));
  public readonly time = computed(() => (this.session() ? sessionHours(this.session()) : ''));
  public readonly place = computed(() => (this.session() ? sessionPlace(this.session()) : ''));
}
