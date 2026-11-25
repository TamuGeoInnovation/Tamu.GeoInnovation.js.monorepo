/**
 * The person types the RSVP dashboard counts (#2878), from the type each person chose on My Details
 * (`app_metadata.gisday.attendeeType`). A student is split by their classification, which is free text: one that reads
 * as neither undergraduate nor graduate is `student`. An account that never completed its profile is `not-given`.
 */
export type RsvpPersonType = 'undergraduate' | 'graduate' | 'student' | 'academia' | 'industry' | 'not-given';

/** The types in the order the dashboard shows them, with their headings. */
export const RSVP_PERSON_TYPES: ReadonlyArray<{ type: RsvpPersonType; label: string }> = [
  { type: 'undergraduate', label: 'Undergraduate' },
  { type: 'graduate', label: 'Graduate' },
  { type: 'student', label: 'Student, classification not given' },
  { type: 'academia', label: 'Faculty & academia' },
  { type: 'industry', label: 'Industry' },
  { type: 'not-given', label: 'Not given' }
];

export type RsvpPersonTypeCounts = Record<RsvpPersonType, number>;

export function emptyCounts(): RsvpPersonTypeCounts {
  return { undergraduate: 0, graduate: 0, student: 0, academia: 0, industry: 0, 'not-given': 0 };
}
