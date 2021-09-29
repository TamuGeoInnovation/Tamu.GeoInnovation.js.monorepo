import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import * as Strategy from 'passport-http-bearer';

import { AuthService } from '../../services/auth.service';

@Injectable()
export class BearerTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super();
  }

  public async validate(jwt: string) {
    const t = await this.auth.validateToken(jwt);

    if (!t) {
      throw new UnauthorizedException();
    }

    return t;
  }
}
