import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

/**
 * NestJS guard used to prevent people from accessing "login" specific routes
 *
 * @export
 * @class AuthenticatedGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  public canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isAuthed = request.isAuthenticated();
    return isAuthed;
  }
}
