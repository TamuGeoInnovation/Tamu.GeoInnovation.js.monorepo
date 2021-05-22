import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ROLE_LEVELS, OpenIdClient } from '../auth/open-id-client';

@Injectable()
export class AzureIdpGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    let canProceed = false;
    if (isAuthed) {
      if (request.user) {
        // Will probably need additional logic here to check for group ID's
        canProceed = true;
      }
    }
    return canProceed;
  }
}

/**
 * NestJS guard used to prevent non-admins from accessing admin routes.
 */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    let canProceed = false;
    if (isAuthed) {
      const tokenIntrospectionResult = await OpenIdClient.client.introspect(request.user.access_token);
      if (tokenIntrospectionResult.active) {
        if (request.user) {
          if (request.user.role) {
            const level = request.user.role.level_role;

            if (level >= ROLE_LEVELS.ADMIN) {
              canProceed = true;
            }
          }
        }
      }
    }
    return canProceed;
  }
}

/**
 * NestJS guard used to prevent users and guests from accessing manager routes.
 */
@Injectable()
export class ManagerRoleGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    let canProceed = false;
    if (isAuthed) {
      const tokenIntrospectionResult = await OpenIdClient.client.introspect(request.user.access_token);
      if (tokenIntrospectionResult.active) {
        if (request.user.claims) {
          if (request.user.role) {
            const level = request.user.role.level_role;

            if (level >= ROLE_LEVELS.MANAGER) {
              canProceed = true;
            }
          }
        }
      }
    }
    return canProceed;
  }
}

/**
 * NestJS guard.
 * May not be necessary as it pretty much functions exactly like the login guard at this level
 */
// TODO: Remove this? Does this not just mean the user is authenticated?
@Injectable()
export class UserRoleGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    let canProceed = false;
    if (isAuthed) {
      if (request.user.claims) {
        if (request.user.role) {
          const level = request.user.role.level_role;

          if (level >= ROLE_LEVELS.USER) {
            canProceed = true;
          }
        }
      }
    }
    return canProceed;
  }
}
