import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { from, groupBy, map, mergeMap, toArray } from 'rxjs';
import { DeepPartial } from 'typeorm';

import { ClientRepo, NewUserRole, NewUserRoleRepo, RoleRepo, UserRepo } from '../../oidc-common';
import { ISimplifiedUserRoleResponse } from '../../types/types';

@Injectable()
export class UserRoleService {
  constructor(
    private readonly userRoleRepo: NewUserRoleRepo,
    private readonly clientRepo: ClientRepo,
    private readonly roleRepo: RoleRepo,
    private readonly userRepo: UserRepo
  ) {}

  public async insertDefaultRoles() {
    // TODO: We prevent another role from being created outside of this method
    // with a role equal to or greater than Admin level 99? - Aaron (6/6/22)

    // Look for an Admin role with this level
    const existingAdmin = await this.roleRepo.findOne({
      where: {
        level: '99'
      }
    });

    // If this level exists, do nothing
    if (existingAdmin) {
      return;
    } else {
      // Role at this level not found, create it
      await this.roleRepo
        .create({
          name: 'Admin',
          level: '99'
        })
        .save();
    }

    const existingManager = await this.roleRepo.findOne({
      where: {
        name: 'Manager',
        level: '80'
      }
    });

    if (existingManager) {
      return;
    } else {
      await this.roleRepo
        .create({
          name: 'Manager',
          level: '80'
        })
        .save();
    }
  }

  public async insertDefaultUserRole(defaultEmail: string, defaultClientId: string, defaultRedirectUris: string[]) {
    const defaultUser = await this.userRepo.findOne({
      where: {
        email: defaultEmail
      }
    });

    const adminRole = await this.roleRepo.findOne({
      where: {
        name: 'Admin',
        level: '99'
      }
    });

    const defaultClient = await this.clientRepo.findOne({
      where: {
        id: defaultClientId
      }
    });

    // Find an existing UserRole with this combination of user, role, and client
    const existingDefaultUserRole = await this.userRoleRepo.count({
      where: {
        user: defaultUser,
        role: adminRole,
        client: defaultClient
      }
    });

    // If UserRole exists, do nothing
    if (existingDefaultUserRole) {
      return;
    }

    // See if client exists
    if (!defaultClient) {
      // Client doesn't exist, create it
      const _client = this.clientRepo.create({
        id: defaultClientId,
        data: JSON.stringify({
          client_id: defaultClientId,
          client_name: defaultClientId,
          redirect_uris: defaultRedirectUris
        }),
        expiresAt: null,
        consumedAt: null
      });

      // Save client to db first
      const client = await this.clientRepo.save(_client);

      await this.userRoleRepo
        .create({
          client,
          user: defaultUser,
          role: adminRole
        })
        .save();
    } else {
      // Since existingDefaultUserRole doesn't exist, create it
      await this.userRoleRepo
        .create({
          client: defaultClient,
          user: defaultUser,
          role: adminRole
        })
        .save();
    }
  }

  public getRoles(accountGuid) {
    return this.userRoleRepo
      .createQueryBuilder('user_role')
      .leftJoinAndSelect('user_role.client', 'client')
      .leftJoinAndSelect('user_role.role', 'role')
      .leftJoinAndSelect('user_role.user', 'user')
      .where('user.account.guid = :accountGuid', { accountGuid })
      .select(['user_role.guid', 'role.level', 'role.name', 'client.id'])
      .getMany();
  }

  public getRole(userRoleGuid) {
    return this.userRoleRepo.findOne({
      where: {
        guid: userRoleGuid
      },
      relations: ['client', 'role', 'user']
    });
  }

  public getAll() {
    return from(
      this.userRoleRepo.find({
        relations: ['role', 'client', 'user', 'user.account']
      })
    ).pipe(
      mergeMap((userRoles) => userRoles),
      map((userRole) => {
        const clientData = JSON.parse(userRole.client.data);

        const ret: ISimplifiedUserRoleResponse = {
          guid: userRole.guid,
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

  public async insertUserRole(body) {
    const client = await this.clientRepo.findOne({
      where: {
        id: body.client_id
      }
    });

    if (!client) {
      throw new UnprocessableEntityException('Must have valid client id');
    }

    const user = await this.userRepo.findOne({
      where: {
        guid: body.userGuid
      }
    });

    if (!user) {
      throw new UnprocessableEntityException('Must have valid user guid');
    }

    const role = await this.roleRepo.findOne({
      where: {
        guid: body.role_id
      }
    });

    if (!role) {
      throw new UnprocessableEntityException('Must have valid role guid');
    }

    // We should check to see if an existing user-role combination exists
    const existingUserRole = await this.userRoleRepo.findOne({
      where: {
        client: client,
        user: user
        // Don't check for role here so we can update an existing role for a defined user-client combo
      }
    });

    if (existingUserRole) {
      // We have an existing user-client combo, update the role
      existingUserRole.role = role;

      return existingUserRole.save();
    }

    // Existing user-combo combo not found, create with role save
    const _userRole: DeepPartial<NewUserRole> = {
      client: client,
      user: user,
      role: role
    };

    return this.userRoleRepo.create(_userRole).save();
  }

  public async delete(guid) {
    const userRole = await this.userRoleRepo.findOne({
      where: {
        guid
      }
    });

    return userRole.remove();
  }
}
