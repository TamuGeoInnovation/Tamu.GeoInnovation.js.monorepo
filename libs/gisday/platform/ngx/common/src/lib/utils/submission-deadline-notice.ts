import {
  DeadlineKind,
  SubmissionDeadlines,
  closedMessage,
  closesAt,
  inCentralTime,
  isDeadlineCompetition
} from '@tamu-gisc/gisday/common';

/** What the submission page says about a competition's deadline (#2934): whether it has passed, and in words. */
export interface DeadlineNotice {
  closed: boolean;
  text: string;
}

/**
 * The notice for a submission type's submissions or files in a season, or null when it has no deadline: paper and
 * cartography, or one the admins have not set. The API refuses what this says is closed; the page only says so first.
 */
export function deadlineNotice(
  season: SubmissionDeadlines | null | undefined,
  submissionType: unknown,
  kind: DeadlineKind,
  now: Date = new Date()
): DeadlineNotice | null {
  const at = closesAt(season, submissionType, kind);

  if (!at || !isDeadlineCompetition(submissionType)) {
    return null;
  }

  if (now.getTime() >= at.getTime()) {
    return { closed: true, text: closedMessage(submissionType, kind, at) };
  }

  return {
    closed: false,
    text:
      kind === 'submissions'
        ? `Submissions to the ${submissionType} competition close on ${inCentralTime(at)}.`
        : `Files can be attached until ${inCentralTime(at)}.`
  };
}
