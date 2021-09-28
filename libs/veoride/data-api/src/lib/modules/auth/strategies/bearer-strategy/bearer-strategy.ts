import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import * as Strategy from 'passport-http-bearer';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class BearerTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    super();
  }

  public async validate(token: string) {
    const t = await this.auth.validateToken(token);

    if (!t) {
      throw new UnauthorizedException();
    }

    return t;
  }
}
