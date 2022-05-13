import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IAuthorizationGuardUser } from '../../oidc-common';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  private ADMIN_LEVEL = '99';

  // TODO: We may not need the EnvironmentService here after all - Aaron H (5/13/22)
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
    const canProceed = roles.some((role) => role.id === user.client_id && role.level === this.ADMIN_LEVEL);

    if (canProceed) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}

