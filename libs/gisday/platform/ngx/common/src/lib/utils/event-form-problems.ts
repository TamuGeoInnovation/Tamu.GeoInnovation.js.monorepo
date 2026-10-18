/**
 * The least an event needs before the admin form will save it (#1773), as the form holds it: the day's
 * guid, times stored as `toTimeString()` text, and the select values.
 */
export interface EventFormValue {
  day?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  name?: string | null;
  abstract?: string | null;
  mode?: string | null;
  eventType?: string | null;
  presentationType?: string | null;
  location?: string | null;
}

/**
 * What is missing or wrong in an event form, one sentence each, in the order the fields appear. An
 * empty list means it may be saved.
 */
export function eventFormProblems(value: EventFormValue): Array<string> {
  const problems: Array<string> = [];

  if (isBlank(value?.day)) {
    problems.push('Choose the day of the event.');
  }

  const start = minutesOfDay(value?.startTime);
  const end = minutesOfDay(value?.endTime);

  if (start === null || start === 0) {
    problems.push('Set a start time; 12:00 AM is the unset default.');
  }

  if (end === null || end === 0) {
    problems.push('Set an end time; 12:00 AM is the unset default.');
  }

  if (start !== null && end !== null && start !== 0 && end !== 0 && end <= start) {
    problems.push('The end time must be after the start time.');
  }

  if (isBlank(value?.name)) {
    problems.push('Give the event a name.');
  }

  if (isBlank(value?.abstract)) {
    problems.push('Give the event an abstract.');
  }

  const choices: Array<[keyof EventFormValue, string]> = [
    ['mode', 'a mode'],
    ['eventType', 'an event type'],
    ['presentationType', 'a presentation type'],
    ['location', 'an event location']
  ];

  for (const [field, label] of choices) {
    if (isBlank(value?.[field])) {
      problems.push(`Choose ${label}.`);
    }
  }

  return problems;
}

/**
 * Empty, whitespace, or the shared select's placeholder, whose value is the text "undefined".
 */
function isBlank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '' || value === 'undefined';
}

/**
 * Minutes after midnight of a time stored as `toTimeString()` text ("14:00:00 GMT-0600 (...)"), or
 * null for one that cannot be read, such as "Invalid Date" (#1772).
 */
function minutesOfDay(time: string | null | undefined): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(time ?? '');

  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
