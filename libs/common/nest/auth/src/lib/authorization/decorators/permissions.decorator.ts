import { SetMetadata } from '@nestjs/common';

/**
 * Provides a flexible way to guard routes based required user permissions
 *
 * @param {string[]} permissions List of permissions in the form of `access:resource` that a user must have to access the resource
 * @param {('all' | 'some')} matchType Match type that should be used to determine if a user has the required permissions. Defaults to 'some'. If 'all' is provided, the user must have all of the permissions provided to pass the guard.
 */
export const Permissions = (permissions: string[], matchType?: PermissionsMatchType) =>
  SetMetadata('Permissions', [permissions, matchType || 'some']);

export type PermissionsMatchType = 'all' | 'some';
