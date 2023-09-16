import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Config injection token
export const JWT_CONFIG = Symbol('JWT_CONFIG');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(JWT_CONFIG) private readonly config: JwtConfig) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${config.issuerUrl}.well-known/jwks.json`
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${config.issuerUrl}`,
      algorithms: ['RS256']
    });
  }

  validate(payload: unknown): unknown {
    return payload;
  }
}

export interface JwtConfig {
  audience: string;
  issuerUrl: string;
}
