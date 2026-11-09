/**
 * The choices for a competition submission, with their labels: what the submission form offers, and what the admin
 * list filters by (#2807). One copy, so a type added for one is offered by both. The values are those of the API's
 * PRESENTATION_* enums, written out because importing those would bring the API's entities into the site's bundle.
 */
export const SUBMISSION_TYPE_OPTIONS: ReadonlyArray<{ type: string; label: string }> = [
  { type: 'presentation', label: 'Presentation' },
  { type: 'paper', label: 'Paper' },
  { type: 'poster', label: 'Poster' },
  { type: 'cartography', label: 'Cartography' }
];

export const SUBMISSION_CLASSIFICATION_OPTIONS: ReadonlyArray<{ type: string; label: string }> = [
  { type: 'undergraduate', label: 'Undergraduate' },
  { type: 'graduate', label: 'Graduate' }
];

export const SUBMISSION_FORMAT_OPTIONS: ReadonlyArray<{ format: string; label: string }> = [
  { format: 'individual', label: 'Individual' },
  { format: 'group', label: 'Group' }
];
