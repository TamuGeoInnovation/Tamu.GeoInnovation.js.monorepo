import { isOwnerOrPermitted } from './is-owner-or-permitted';

describe('isOwnerOrPermitted', () => {
  const ann = { sub: 'auth0|ann', permissions: [] };
  const organizer = { sub: 'auth0|org', permissions: ['read:competitions'] };

  it('lets the owner through', () => {
    expect(isOwnerOrPermitted(ann, 'auth0|ann', 'read:competitions')).toBe(true);
  });

  it('refuses someone else', () => {
    expect(isOwnerOrPermitted(ann, 'auth0|bob', 'read:competitions')).toBe(false);
  });

  it('lets someone else through when they hold the permission', () => {
    expect(isOwnerOrPermitted(organizer, 'auth0|ann', 'read:competitions')).toBe(true);
  });

  it('does not accept a different permission', () => {
    expect(isOwnerOrPermitted(organizer, 'auth0|ann', 'update:competitions')).toBe(false);
  });

  it('with no permission named, lets only the owner through', () => {
    expect(isOwnerOrPermitted(organizer, 'auth0|ann')).toBe(false);
    expect(isOwnerOrPermitted(ann, 'auth0|ann')).toBe(true);
  });

  it('refuses a user with no sign-in, even for a record with no owner', () => {
    expect(isOwnerOrPermitted(undefined, 'auth0|ann', 'read:competitions')).toBe(false);
    expect(isOwnerOrPermitted({}, undefined, 'read:competitions')).toBe(false);
    expect(isOwnerOrPermitted({ permissions: undefined }, 'auth0|ann', 'read:competitions')).toBe(false);
  });
});
