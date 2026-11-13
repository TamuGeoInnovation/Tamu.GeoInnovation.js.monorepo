import { emptyCounts, RsvpPersonTypeCounts } from '@tamu-gisc/gisday/common';

import type { RsvpDashboardPerson } from '../../user-rsvp/dto/rsvp-dashboard.dto';

/** One university or employer on the User accounts dashboard (#2892): its accounts, counted by person type. */
export interface AccountDashboardRow {
  /** The university or employer's name, lowercased, or `not-given`: what the row's people are asked for by. */
  key: string;
  name: string;
  total: number;
  counts: RsvpPersonTypeCounts;
}

/**
 * A season's User accounts dashboard (#2892): the accounts with a GIS Day profile made between the previous GIS Day and
 * this one, by university or employer and person type, and when each was made. Counts only: names and emails are read
 * one row at a time.
 */
export interface AccountDashboard {
  /** The window: from the day after the previous season's last day (null if there is none) to the end of this one's. */
  window: { from: string | null; to: string };
  /** Accounts with a GIS Day profile, made in the window. */
  accounts: number;
  /**
   * Every account the sign-in service made in the window, profile or not. The tenant is shared, so this is an upper
   * bound on GIS Day's sign-ups that never finished a profile, not a count of them.
   */
  allAccounts: number;
  rows: Array<AccountDashboardRow>;
  /** When each counted account was made, oldest first, for the chart. */
  made: Array<string>;
}

const CENTRAL = 'America/Chicago';
export const NOT_GIVEN_KEY = 'not-given';

/** The calendar day of `date` in Central time, as YYYY-MM-DD. */
export function centralDay(date: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CENTRAL, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(date)
  );
}

/** Midnight at the start of `day` (YYYY-MM-DD) in Central time, in standard time and daylight time alike. */
export function centralMidnight(day: string): Date {
  // Midnight in standard time; if the zone is in daylight time that day, that is 1 AM, so step back an hour.
  const guess = new Date(`${day}T06:00:00.000Z`);
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: CENTRAL, hour: '2-digit', hourCycle: 'h23' }).format(guess));

  return new Date(guess.getTime() - hour * 60 * 60 * 1000);
}

/** The day after `day` (YYYY-MM-DD). */
function nextDay(day: string): string {
  const d = new Date(`${day}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);

  return d.toISOString().slice(0, 10);
}

/**
 * The window a season's accounts are counted in (decided on #2892): from the start of the day after the previous
 * season's last day to the end of this season's last day, in Central time. With no previous season, or none with a
 * day, it starts at the beginning; with no day of its own, it ends `now`.
 */
export function seasonWindow(days: Array<Date | string>, previousDays: Array<Date | string>, now = new Date()): { from: Date | null; to: Date } {
  const last = (ds: Array<Date | string>) => ds.map(centralDay).sort().pop();
  const thisLast = last(days);
  const previousLast = last(previousDays);

  return {
    from: previousLast ? centralMidnight(nextDay(previousLast)) : null,
    to: thisLast ? centralMidnight(nextDay(thisLast)) : now
  };
}

/** The row an account belongs to: its university or employer's name, ignoring case and spacing. */
export function accountRowKey(organization: string | null): string {
  const name = (organization ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

  return name || NOT_GIVEN_KEY;
}

/**
 * The accounts as rows, one per university or employer, each counted by person type; the most accounts first, then by
 * name, with the accounts that name neither last.
 */
export function accountRows(people: Array<RsvpDashboardPerson>): Array<AccountDashboardRow> {
  const rows = new Map<string, AccountDashboardRow>();

  for (const person of people) {
    const key = accountRowKey(person.organization);
    const row = rows.get(key) ?? {
      key,
      name: key === NOT_GIVEN_KEY ? 'No university or employer given' : person.organization.trim().replace(/\s+/g, ' '),
      total: 0,
      counts: emptyCounts()
    };

    row.total++;
    row.counts[person.type]++;
    rows.set(key, row);
  }

  return [...rows.values()].sort((a, b) =>
    a.key === NOT_GIVEN_KEY ? 1 : b.key === NOT_GIVEN_KEY ? -1 : b.total - a.total || a.name.localeCompare(b.name)
  );
}
