import { Injectable } from '@nestjs/common';

import { from, groupBy, map, mergeMap, pluck, toArray } from 'rxjs';

import { NewUserRoleRepo } from '../../oidc-common';
import { ISimplifiedUserRoleResponse } from '../../types/types';

@Injectable()
export class UserRoleService {
  constructor(private readonly userRoleRepo: NewUserRoleRepo) {}

  public getAll() {
    // return this.userRoleRepo.find({
    //   relations: ['role', 'client', 'user', 'user.account']
    // });
    return from(
      this.userRoleRepo.find({
        relations: ['role', 'client', 'user', 'user.account']
      })
    ).pipe(
      mergeMap((userRoles) => userRoles),
      map((userRole) => {
        const clientData = JSON.parse(userRole.client.data);
        const ret: ISimplifiedUserRoleResponse = {
          role: {
            level: userRole.role.level,
            name: userRole.role.name
          },
          user: {
            email: userRole.user.email,
            name: userRole.user.account.name
          },
          client: {
            clientId: clientData.client_id,
            clientName: clientData.client_name
          }
        };

        return ret;
      }),
      groupBy((userRole) => {
        return userRole.client.clientId;
      }),
      mergeMap((group) => group.pipe(toArray())),
      toArray()
    );
  }
}

