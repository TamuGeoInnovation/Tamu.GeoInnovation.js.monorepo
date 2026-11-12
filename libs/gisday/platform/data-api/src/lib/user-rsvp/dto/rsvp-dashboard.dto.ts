import type { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';
import { emptyCounts, RsvpPersonType, RsvpPersonTypeCounts } from '@tamu-gisc/gisday/common';

export { emptyCounts };
export type { RsvpPersonType, RsvpPersonTypeCounts };

/** One event's row on the dashboard: counts only, no names. */
export interface RsvpDashboardEvent {
  guid: string;
  name: string;
  /** When the event starts (its day at its start time, in Central time), or null for an event with no day or time. */
  starts: string | null;
  location: string | null;
  total: number;
  counts: RsvpPersonTypeCounts;
}

/** When one RSVP was made, and for which event: what the RSVPs-over-time chart is drawn from. */
export interface RsvpDashboardMade {
  event: string;
  created: string;
}

export interface RsvpDashboard {
  events: Array<RsvpDashboardEvent>;
  /** Every RSVP for the season's events, oldest first. */
  made: Array<RsvpDashboardMade>;
  /** Accounts whose profile could not be read (deleted, or Auth0 management unavailable): counted as Not given. */
  unreadAccounts: number;
}

/** One person who RSVP'd, in an event's expanded list and its CSV. */
export interface RsvpDashboardPerson {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  type: RsvpPersonType;
  /** What a student wrote as their classification. */
  classification: string | null;
  /** A student's field of study, or anyone else's department. */
  department: string | null;
  /** Anyone but a student: their position. */
  position: string | null;
  /** A student's institution, or anyone else's employer, by name. */
  organization: string | null;
  /** When they RSVP'd. */
  created: string;
}

const GRADUATE = /\b(grad(uate)?|master'?s?|ms|ma|mba|meng|mcp|mgis|phd|ph\.?\s?d|doctoral|doctorate|postdoc|g[1-9])\b/;
const UNDERGRADUATE =
  /\b(undergrad(uate)?|freshman|freshmen|sophomore|junior|senior|first[- ]year|second[- ]year|third[- ]year|fourth[- ]year|bachelor'?s?|ba|bs|u[1-5])\b/;

/** Undergraduate, graduate, or null when the free-text classification reads as neither. */
export function studentLevelOf(classification: string | null | undefined): 'undergraduate' | 'graduate' | null {
  const text = (classification ?? '').toLowerCase().trim();

  if (!text) {
    return null;
  }

  // "Undergraduate" contains "graduate", so the undergraduate words are tried first.
  if (UNDERGRADUATE.test(text)) {
    return 'undergraduate';
  }

  if (GRADUATE.test(text)) {
    return 'graduate';
  }

  return null;
}

export function personTypeOf(profile: Auth0UserProfile | null | undefined): RsvpPersonType {
  const attendeeType = profile?.app_metadata?.gisday?.attendeeType;

  if (attendeeType === 'student') {
    return studentLevelOf(profile?.user_metadata?.education?.classification) ?? 'student';
  }

  if (attendeeType === 'academia' || attendeeType === 'industry') {
    return attendeeType;
  }

  return 'not-given';
}

/**
 * The person as the expanded list shows them. `organizations` names the university and organization ids a profile
 * stores as its institution or employer.
 */
export function personOf(
  profile: Auth0UserProfile | null | undefined,
  created: Date | string,
  organizations: ReadonlyMap<string, string>
): RsvpDashboardPerson {
  const info = profile?.user_info;
  const education = profile?.user_metadata?.education;
  const occupation = profile?.user_metadata?.occupation;
  const type = personTypeOf(profile);
  const isStudent = type === 'undergraduate' || type === 'graduate' || type === 'student';

  const named = Boolean(info?.given_name || info?.family_name);
  const nameOf = (id: string | undefined, other: string | undefined) =>
    (id && id !== 'other' ? organizations.get(id) ?? null : other || null) ?? null;

  return {
    firstName: (named ? info?.given_name : info?.name) || null,
    lastName: (named && info?.family_name) || null,
    email: info?.email || null,
    type,
    classification: (isStudent && education?.classification) || null,
    department: (isStudent ? education?.fieldOfStudy : occupation?.department) || null,
    position: (!isStudent && occupation?.position) || null,
    organization: isStudent
      ? nameOf(education?.institution, education?.otherInstitution)
      : nameOf(occupation?.employer, occupation?.otherEmployer),
    created: new Date(created).toISOString()
  };
}
