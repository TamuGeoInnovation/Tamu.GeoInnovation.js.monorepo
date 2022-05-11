import { Injectable } from '@nestjs/common';

import { from, groupBy, map, mergeMap, toArray } from 'rxjs';

import { NewUserRoleRepo } from '../../oidc-common';

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
        const ret = {
          role: {
            level: userRole.role.level,
            name: userRole.role.name
          },
          user: {
            email: userRole.user.email,
            name: userRole.user.account.name
          },
          client: {
            client_id: clientData.client_id,
            client_name: clientData.client_name
          }
        };

        return ret;
      }),
      groupBy((userRole) => {
        return userRole.client.client_id;
      }),
      mergeMap((group) => group.pipe(toArray())),
      toArray()
    );
  }
}

