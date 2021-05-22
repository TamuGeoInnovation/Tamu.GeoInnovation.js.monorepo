import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

import { OpenIdClient } from '../auth/open-id-client';

/**
 * NestJS guard used to prevent people from accessing "login" specific routes
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
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
