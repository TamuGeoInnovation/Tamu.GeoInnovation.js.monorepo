import type { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';

import type { Submission } from '../../entities/all.entity';

/**
 * Who submitted a competition entry, as the admin list shows it (#2799). A submission keeps only its submitter's
 * account id; the rest is their Auth0 profile.
 */
export interface SubmissionSubmitter {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  /** The field of study for a student, the department for anyone else. */
  department: string | null;
}

/** A submission in the admin list: `submitter` is null when the account could not be read. */
export type SubmissionWithSubmitter = Submission & { submitter: SubmissionSubmitter | null };

export function submitterOf(profile: Auth0UserProfile): SubmissionSubmitter {
  const info = profile?.user_info;
  const education = profile?.user_metadata?.education;
  const occupation = profile?.user_metadata?.occupation;
  const isStudent = profile?.app_metadata?.gisday?.attendeeType === 'student';

  const department = isStudent
    ? education?.fieldOfStudy || occupation?.department
    : occupation?.department || education?.fieldOfStudy;

  // An account with no given or family name (some social sign-ins) still has a display name.
  const named = Boolean(info?.given_name || info?.family_name);

  return {
    firstName: (named ? info?.given_name : info?.name) || null,
    lastName: (named && info?.family_name) || null,
    email: info?.email || null,
    department: department || null
  };
}
