import { Injectable, NestMiddleware, UnauthorizedException, Req, Res } from '@nestjs/common';
import { OpenIdClient } from '../auth/open-id-client';

/**
 * Simple middleware function that will fetch the user's claims from the IdP.
 * Only works if you have a "user" property in req.
 * @export
 * @param {*} req
 * @param {*} res
 * @param {*} next
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
