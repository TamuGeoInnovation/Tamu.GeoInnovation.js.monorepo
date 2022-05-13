import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IAuthorizationGuardUser } from '../../oidc-common';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private readonly env: EnvironmentService) {
    super();
  }

  public canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  public handleRequest(err, user, info) {
    if (err || !user) {
      console.warn(info);

      throw err || new UnauthorizedException();
    }

    const roles = (user as IAuthorizationGuardUser)?.roles;
    roles.forEach((role) => {
      if (role.id !== user.client_id || role.level !== '99') {
        throw new UnauthorizedException();
      }
    });

    return user;
  }
}

