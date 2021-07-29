import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthUtils } from '../utils/auth.util';
import { ROLE_LEVELS, OpenIdClient } from '../auth/open-id-client';

@Injectable()
export class AzureIdpGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    let canProceed = false;
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    const expired = Date.now() > request.user.expires_at * 1000;

    if (isAuthed && !expired) {
      if (request.user) {
        canProceed = true;
      }
    }
    return canProceed;
  }
}

// Lets keep this and IsAuthenticatedGuard for now until we know for sure
// using the TokenExchangeMiddleware is the direction we need to go
export abstract class PassportTokenGuard {
  public async canProceed(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    let canProceed = false;

    if (isAuthed) {
      if (request.user) {
        const tokenIntrospectionResult = await OpenIdClient.client.introspect(request.user.access_token);
        if (tokenIntrospectionResult.active) {
          canProceed = true;
        } else {
          const refreshIntrospectionResult = await OpenIdClient.client.introspect(request.user.refresh_token);

          if (refreshIntrospectionResult.active) {
            const tokenSet = await OpenIdClient.client.refresh(request.user.refresh_token);
            AuthUtils.updateTokenSet(request, tokenSet);

            canProceed = true;
          } else {
            console.warn('Refresh token failed introspection; redirect to login');
            await OpenIdClient.client.revoke(request.user.access_token).then(() => {
              throw new UnauthorizedException();
            });
          }
        }
      } else {
        console.warn('request.user is null or undefined', request);
        throw new UnauthorizedException();
      }
    } else {
      console.warn('not authed');
      throw new UnauthorizedException();
    }

    return canProceed;
  }
}

@Injectable()
export class IsAuthenticatedGuard extends PassportTokenGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    return super.canProceed(context).then((result) => {
      if (result && request.isAuthenticated()) {
        return true;
      } else {
        return false;
      }
    });
  }
}

@Injectable()
export class AdminGuard extends PassportTokenGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    return super.canProceed(context).then((canProceed) => {
      if (canProceed) {
        const level = request.user.role.level_role;

        if (level >= ROLE_LEVELS.ADMIN) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
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
      } else {
        // Access token has failed introspection and we can assume it has expired
        if (request.user.refresh_token) {
          // Use the refresh_token to get a new access_token
          const refreshIntrospectionResult = await OpenIdClient.client.introspect(request.user.refresh_token);

          // is refresh token still good? If so, then use it to get new access token
          if (refreshIntrospectionResult.active) {
            const tokenSet = await OpenIdClient.client.refresh(request.user.refresh_token);
            AuthUtils.updateTokenSet(request, tokenSet);

            canProceed = true;
          } else {
            // if refresh token is no good we'll redirect to login screen i guess?
            // TODO: Add a redirect here? Ask Edgar's thoughts
            console.warn('Refresh token failed introspection too', request.user.refresh_token);
          }
        } else {
          console.warn('No refresh_token');
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
