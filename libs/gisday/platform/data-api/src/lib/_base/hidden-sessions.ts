import { NotFoundException } from '@nestjs/common';

/** A session, as far as whether the public may see it: a hidden one is `active` false (#2092). */
type Showable = { active?: boolean | null };

/** The account behind a request, if any, as the sign-in leaves it on the request. */
type Account = { permissions?: Array<string> } | undefined;

/**
 * Whether an account may see hidden sessions: one that may put a session back on the schedule (update:events), so the
 * admin pages that read the public routes still see every session (#3354).
 */
export function seesHiddenSessions(account: Account): boolean {
  return account?.permissions?.includes('update:events') ?? false;
}

/** Whether the public sees a session: every one not hidden (#3345, #3354). */
export function onSchedule(session: Showable): boolean {
  return session.active !== false;
}

/** The sessions an account may see: all of them for an admin, else only those on the schedule. */
export function sessionsShownTo<T extends Showable>(sessions: Array<T>, account: Account): Array<T> {
  return seesHiddenSessions(account) ? sessions : sessions.filter(onSchedule);
}

/** A session by its id, if the account may see it; a hidden one is not found, as one that does not exist. */
export function sessionShownTo<T extends Showable>(session: T | null | undefined, account: Account): T {
  if (!session || !sessionsShownTo([session], account).length) {
    throw new NotFoundException();
  }

  return session;
}
