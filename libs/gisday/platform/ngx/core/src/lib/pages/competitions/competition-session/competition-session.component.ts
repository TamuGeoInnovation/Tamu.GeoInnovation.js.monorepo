import { ChangeDetectionStrategy, Component, Injectable, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import {
  ReviewEmailSession,
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

  public readonly session = computed(() => {
    const sessions = this.sessions();
    const kind = this.kind();

    if (kind === 'awards') {
      return awardsSession(sessions);
    }

    return kind === 'poster'
      ? competitionSession(sessions, 'poster', null)
      : competitionSession(sessions, 'presentation', kind);
  });

  public readonly day = computed(() => (this.session() ? sessionDay(this.session(), 'long') : ''));
  public readonly time = computed(() => (this.session() ? sessionHours(this.session()) : ''));
  public readonly place = computed(() => (this.session() ? sessionPlace(this.session()) : ''));
}
