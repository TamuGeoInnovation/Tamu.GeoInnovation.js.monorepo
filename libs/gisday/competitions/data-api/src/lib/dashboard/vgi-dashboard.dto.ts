import type { RsvpDashboardMade, RsvpDashboardPerson } from '@tamu-gisc/gisday/platform/data-api';

/**
 * A feature type's counts on the VGI submissions dashboard (#2894). A type, not an interface, so it is a
 * `Record<string, number>` as the shared dashboard page reads every row's counts.
 */
export type VgiDashboardCounts = {
  /** Submissions the leaderboard scores as new finds, and as repeats; a discarded one, or one outside the scoring window, is neither. */
  newFinds: number;
  repeats: number;
  /** The people who submitted this type. */
  people: number;
  /** The submissions by review status; one not yet reviewed is unverified. */
  unverified: number;
  verified: number;
  discarded: number;
};

/**
 * One feature type, as chosen on the season's form: its submissions and their counts. Shaped as the other dashboards'
 * rows, so the shared dashboard page draws it: `guid` is the type's value on the form (`none` for no type chosen), and
 * `starts` is always null.
 */
export interface VgiDashboardType {
  guid: string;
  name: string;
  starts: null;
  /** Every submission of this type. */
  total: number;
  counts: VgiDashboardCounts;
}

/** A season's VGI submissions by feature type, and when each was made, by type, for the chart. */
export interface VgiDashboard {
  /** The GIS Day season, whose submitters a row opens to. */
  season: string;
  /** The people who submitted anything, each once, for the total row. */
  people: number;
  events: Array<VgiDashboardType>;
  made: Array<RsvpDashboardMade>;
  unreadAccounts: number;
}

/** A person who submitted a feature type, with their counts of it; `created` is their first submission of it. */
export interface VgiSubmitter extends RsvpDashboardPerson {
  counts: { submissions: number; newFinds: number; repeats: number };
}
