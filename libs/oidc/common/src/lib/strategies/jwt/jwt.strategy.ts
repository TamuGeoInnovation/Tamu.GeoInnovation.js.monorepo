import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { passportJwtSecret } from 'jwks-rsa';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { JWKS_URL } from '../../modules/tokens/jwks_url.token';

/**
 * DEPRECATED: Prefer the use of the `AuthorizationModule` and `JwtStrategy` from `@tamu-gisc/common/nest/auth`.
 *
 * @export
 * @deprecated
 * @class JwtStrategy
 * @extends {PassportStrategy(Strategy)}
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(JWKS_URL) private readonly url: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: url
      })
    });
  }

  public validate(payload) {
    return payload;
  }
}
