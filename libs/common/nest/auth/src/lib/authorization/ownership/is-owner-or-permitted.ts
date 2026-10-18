/**
 * The parts of a signed-in user (`req.user`, from the JWT) that an ownership check reads.
 */
export interface OwnershipUser {
  sub?: string;
  permissions?: Array<string>;
}

/**
 * Whether `user` may act on a record that belongs to `ownerGuid`: they own it, or they hold
 * `permission`, which lets them act on anyone's. Without a `permission`, only the owner may.
 *
 * A user with no `sub` owns nothing, so a missing sign-in never matches a record with no owner.
 */
export function isOwnerOrPermitted(user: OwnershipUser | undefined, ownerGuid: string, permission?: string): boolean {
  if (permission !== undefined && Array.isArray(user?.permissions) && user.permissions.includes(permission)) {
    return true;
  }

  return Boolean(user?.sub) && user.sub === ownerGuid;
}
