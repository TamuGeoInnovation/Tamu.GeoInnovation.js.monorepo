import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { sessionTime, siteListsSession } from '@tamu-gisc/gisday/common';
import type { Event } from '@tamu-gisc/gisday/platform/data-api';

import { GISDAY_SITE } from '../../site/site';

/** A session as the list shows it: when it starts, in Central time, and its name. */
interface SessionUsing {
  guid: string;
  name: string;
  day: string;
  time: string;
}

const DAY = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});
const TIME = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' });

/**
 * The sessions that use what an admin page edits (#3032, #3033): a broadcast's, a tag's. Each session's day, time and
 * name, linked to the session's admin page, in date and time order, with a count, or `none` when there are none. Only
 * the sessions this site lists (#2986). The page gives it the sessions and its wording.
 */
@Component({
  selector: 'tamu-gisc-sessions-using',
  templateUrl: './sessions-using.component.html',
  imports: [RouterLink]
})
export class SessionsUsingComponent {
  private readonly site = inject(GISDAY_SITE);

  /** The sessions, or null while they are read. */
  public readonly sessions = input<Array<Partial<Event>> | null>(null);
  /** The count's words for one and for several: "session uses this broadcast", "sessions use this broadcast". */
  public readonly one = input('session uses this');
  public readonly many = input('sessions use this');
  /** What it says when there are none. */
  public readonly none = input('No sessions use this.');

  /** The site's sessions, earliest first; one with no day or time last. */
  public readonly listed = computed<Array<SessionUsing> | null>(() => {
    const sessions = this.sessions();

    if (!sessions) {
      return null;
    }

    return sessions
      .filter((s) => siteListsSession(this.site, s))
      .map((s) => ({ session: s, at: sessionTime(s.day?.date, s.startTime) }))
      .sort((a, b) => (a.at?.getTime() ?? Infinity) - (b.at?.getTime() ?? Infinity))
      .map(({ session, at }) => ({
        guid: session.guid,
        name: session.name ?? 'Untitled session',
        day: at ? DAY.format(at) : 'No day set',
        time: at ? TIME.format(at) : ''
      }));
  });
}
