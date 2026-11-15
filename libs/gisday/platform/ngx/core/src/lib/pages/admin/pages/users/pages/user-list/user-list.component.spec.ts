import type { Auth0UserProfile } from '@tamu-gisc/common/nest/auth';

import { matchesUser } from './user-list.component';

const user = (name: string, email: string, id: string) => ({ user_info: { name, email, id } }) as unknown as Auth0UserProfile;

/** #2914: the Users page searches the columns it shows. */
describe('matchesUser()', () => {
  const ana = user('Ana Lee', 'ana@example.edu', 'auth0|123');

  it('finds a user by name, email or connection id, ignoring case', () => {
    expect(matchesUser(ana, 'ana lee')).toBe(true);
    expect(matchesUser(ana, 'EXAMPLE.EDU')).toBe(true);
    expect(matchesUser(ana, 'auth0|12')).toBe(true);
    expect(matchesUser(ana, 'google')).toBe(false);
  });

  it('matches everyone for an empty search', () => {
    expect(matchesUser(ana, '  ')).toBe(true);
  });
});
