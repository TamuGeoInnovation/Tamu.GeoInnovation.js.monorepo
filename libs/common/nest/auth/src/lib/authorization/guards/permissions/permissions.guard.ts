import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsMatchType } from '../../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const decoratorArgs = this.reflector.get<[string[], PermissionsMatchType]>('Permissions', context.getHandler());

    // If the decorator is not present, default to denying the request.
    if (decoratorArgs === undefined) {
      Logger.warn('Using permissions guard but no decorator found. Denying request.', context.getClass().name);
      throw new UnauthorizedException();
    }

    const [requiredPermissions, matchType] = decoratorArgs;

    if (requiredPermissions && requiredPermissions.length === 0) {
      Logger.warn('Required permissions length is 0. Granting request.', context.getClass().name);
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (request.user === undefined) {
      throw new UnauthorizedException();
    }

    if (request.user.permissions === undefined) {
      throw new ForbiddenException();
    }

    const permissions = request.user.permissions;
    let ret: boolean;

    if (matchType === 'all') {
      ret = this._testMatchAll(permissions, requiredPermissions);
    } else {
      ret = this._testMatchSome(permissions, requiredPermissions);
    }

    if (ret === false) {
      throw new ForbiddenException();
    }

    return true;
  }

  private _testMatchAll(permissions: Array<string>, requiredPermissions: Array<string>): boolean {
    return requiredPermissions.every((rp) => {
      return permissions.includes(rp);
    });
  }

  private _testMatchSome(permissions: Array<string>, requiredPermissions: Array<string>): boolean {
    return requiredPermissions.some((rp) => {
      return permissions.includes(rp);
    });
  }
}
