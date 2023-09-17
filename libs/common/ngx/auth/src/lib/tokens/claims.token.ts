import { InjectionToken } from '@angular/core';

/**
 * Name of the claim/property in the users ID token (JWT) that contains the user's roles.
 *
 * Used by the `RoleGuard` to check if a user has any of the required roles.
 *
 **/
export const ROLES_CLAIM = new InjectionToken<string>('ROLES_CLAIM');
