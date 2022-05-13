import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IAuthorizationGuardUser } from '../../oidc-common';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  public canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  public handleRequest(err, user, info) {
    if (err || !user) {
      console.warn(info);

      throw err || new UnauthorizedException();
    }

    return user;
  }
}

@Injectable()
export class AuthorizationGuard extends AuthGuard('jwt') {
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

    // TODO: REMOVE AFTER WORKING - Aaron H (5/12/22)
    // console.log('AuthorizationGuard', user, this.env.value('client_id'));

    const roles = (user as IAuthorizationGuardUser)?.roles;
    roles.map((role) => {
      if (role.id === user.client_id) {
        if (role.level === '99') {
          // ADMIN, PROCEED
        } else {
          throw new UnauthorizedException();
        }
      } else {
        throw new UnauthorizedException();
      }
    });

    return user;
  }
}
