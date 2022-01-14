import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { ROLES } from '../../types/ues-common-types';
import { GROUPS_KEY } from '../../decorators/groups/groups.decorator';

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredGroups = this.reflector.getAllAndOverride<Array<ROLES>>(GROUPS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredGroups || requiredGroups.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.claims || !user.claims.groups) {
      return false;
    }

    const userAssignedGroups: Array<ROLES> = user.claims.groups;

    return userAssignedGroups.some((uag) => {
      return requiredGroups.includes(uag);
    });
  }
}
