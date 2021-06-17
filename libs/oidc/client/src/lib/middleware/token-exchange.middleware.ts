import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

import { OpenIdClient } from '../auth/open-id-client';
import { AuthUtils } from '../../../../common/src/lib/utils/auth/auth.util';

@Injectable()
export class TokenExchangeMiddleware implements NestMiddleware {
  public async use(request: any, response: Response, next: NextFunction) {
    if (request.user) {
      const tokenIntrospectionResult = await OpenIdClient.client.introspect(request.user.access_token);
      if (tokenIntrospectionResult.active == false) {
        const refreshIntrospectionResult = await OpenIdClient.client.introspect(request.user.refresh_token);
        if (refreshIntrospectionResult.active) {
          const tokenSet = await OpenIdClient.client.refresh(request.user.refresh_token);
          AuthUtils.updateTokenSet(request, tokenSet);
        } else {
          console.warn('Refresh token failed introspection; redirect to login');
        }
      } else {
        console.warn('Access token still valid');
      }
    } else {
      console.warn('User is not logged in');
    }

    next();
  }
}
