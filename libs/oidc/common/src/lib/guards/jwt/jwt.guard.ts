import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  public override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  public override handleRequest(err, user, info) {
    if (err || !user) {
      console.warn(info);

      throw err || new UnauthorizedException();
    }

    return user;
  }
}
