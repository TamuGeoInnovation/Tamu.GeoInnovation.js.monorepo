import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { OpenIdClient } from '@tamu-gisc/oidc/client';

/**
 * NestJS guard used to prevent people from accessing "login" specific routes
 *
 * @export
 * @class AuthenticatedGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    const tokenIntrospectionResult = await OpenIdClient.client.introspect(request.user.access_token);
    if (isAuthed && tokenIntrospectionResult.active) {
      return true;
    } else {
      return false;
    }
  }
}
