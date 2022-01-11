import { Roles } from '@tamu-gisc/ues/common/nest';

/**
 * Checks if the provided user roles include any of the provided accepted roles.
 *
 * Returns true if condition passes, otherwise returns false.
 */
export function isAuthorized(userRoles: Array<Roles>, acceptedRoles: Array<Roles>): boolean {
  if (userRoles && acceptedRoles && userRoles.length > 0 && acceptedRoles.length > 0) {
    const userRolesAuthorized = userRoles.some((role) => {
      return acceptedRoles.includes(role);
    });

    return userRolesAuthorized;
  } else {
    return false;
  }
}
