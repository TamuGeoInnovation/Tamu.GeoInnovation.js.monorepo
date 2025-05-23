import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Guard that checks if the authenticated user has admin privileges.
 *
 * This guard should only be used in conjunction with LegacyAuthGuard, which handles
 * user authentication and injects the user context into the request.
 *
 * The guard checks for the presence of the `isManager` boolean property in the user
 * context to determine admin access. Only users with `isManager: true` will be allowed
 * to proceed.
 *
 * @example
 * ```typescript
 * @UseGuards(LegacyAuthGuard, LegacyAdminGuard)
 * @Get('admin-only-endpoint')
 * adminOnlyMethod() {
 *   // This method can only be accessed by authenticated admin users
 * }
 * ```
 */
@Injectable()
export class LegacyAdminGuard implements CanActivate {
  /**
   * Determines if the current user has admin privileges.
   *
   * @param context The execution context containing the request
   * @returns true if the user is an admin (has isManager: true), false otherwise
   */
  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and has the isManager property set to true
    return user && user.isManager === true;
  }
}
