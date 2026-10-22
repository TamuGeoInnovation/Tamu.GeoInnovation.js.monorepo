/**
 * The file one GIS Day site exports and another imports (#2078).
 *
 * Every site runs the same schema, so a record means the same thing on both sides. Records keep their
 * `guid`, so importing the same file twice updates what is there instead of duplicating it. A record's
 * links to other records are their guids, as `{ guid }` for one and `[{ guid }]` for many.
 */
export interface SiteCopyFile {
  format: 'gisday-site-copy';
  version: 1;

  /** The site it came from, such as `https://txgisday.org`. Logos and photos are fetched from it. */
  source: string;

  /** When it was exported, as an ISO 8601 time. */
  exportedAt: string;

  /** The exported season's year, for the import page to show before anything else is read. */
  year: number;

  records: SiteCopyRecords;
}

/** One list per kind, in the order an import writes them, so each record's links already exist. */
export type SiteCopyRecords = Record<SiteCopyKind, Array<SiteCopyRecord>>;

export type SiteCopyRecord = Record<string, unknown> & { guid: string };

export const SITE_COPY_KINDS = [
  'seasons',
  'seasonDays',
  'places',
  'placeLinks',
  'organizations',
  'universities',
  'eventLocations',
  'eventBroadcasts',
  'tags',
  'speakers',
  'events',
  'assets'
] as const;

export type SiteCopyKind = (typeof SITE_COPY_KINDS)[number];

/** What an import did, or would do in a dry run, to each kind of record. */
export interface SiteCopyPlan {
  applied: boolean;

  /** Why the import cannot go ahead. An import with any is refused, even when asked to apply. */
  blockers: Array<string>;

  /** Links that were left out because the record they named is neither in the file nor on this site. */
  warnings: Array<string>;

  kinds: Array<SiteCopyKindPlan>;

  /**
   * Logos and photos: how many this site does not have yet, and, when applied, how many were fetched from
   * the source and written, and which could not be. Only missing ones are fetched, so applying again
   * retries any that failed.
   */
  files: { missing: number; written: number; failed: Array<string> };
}

export interface SiteCopyKindPlan {
  kind: SiteCopyKind;

  /** The names of records this site does not have yet. */
  added: Array<string>;

  /** The names of records this site has, with different values. */
  updated: Array<string>;

  /** How many records this site already has exactly as they are in the file. */
  unchanged: number;
}
