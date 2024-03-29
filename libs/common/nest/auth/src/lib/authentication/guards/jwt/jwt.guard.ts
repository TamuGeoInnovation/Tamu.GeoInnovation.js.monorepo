import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private rf: Reflector) {
    super();
  }

  public handleRequest<TUser>(err, user, info, context): TUser {
    const allowAny = this.rf.get<string[]>('AllowAny', context.getHandler());

    if (user) {
      return user;
    }

    if (allowAny && allowAny.length) {
      return user;
    }

    throw new UnauthorizedException();
  }
}
