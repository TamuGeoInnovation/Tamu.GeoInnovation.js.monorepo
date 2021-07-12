import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

import jwt_decode from 'jwt-decode';

import { OpenIdClient } from '../auth/open-id-client';

/**
 * Simple middleware function that will fetch the user's claims from the IdP.
 * Only works if you have a "user" property in req.
 */
@Injectable()
export class ClaimsMiddleware implements NestMiddleware {
  public async use(req, res, next: () => void) {
    if (req.user) {
      const userInfo = await OpenIdClient.client
        .userinfo(req.user.access_token)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.warn(err);
          throw new UnauthorizedException();
        });

      req.user.claims = userInfo;
    }
    next();
  }
}

/**
 * Simple middleware function that will fetch the user's claims from the IdP including groups from id token.
 *
 * Only works if you have a "user" property in req.
 */
@Injectable()
export class GroupClaimsMiddleware implements NestMiddleware {
  public async use(req, res, next: () => void) {
    if (req.user) {
      try {
        const userInfo = await OpenIdClient.client.userinfo(req.user.access_token);
        const id_token: { groups?: Array<string> } = jwt_decode(req.user.id_token);
        const groups = id_token?.groups;

        req.user.claims = userInfo;
        req.user.claims.groups = groups;
      } catch (err) {
        console.warn(err);
        throw new UnauthorizedException();
      }
    }

    next();
  }
}
