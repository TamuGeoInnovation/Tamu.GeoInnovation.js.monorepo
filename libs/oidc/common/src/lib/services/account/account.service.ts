import { Injectable } from '@nestjs/common';

import { getConnection } from 'typeorm';

import { AccountRepo, RoleRepo, User } from '../../entities/all.entity';

export class StaticAccountService {
  public static async getUserRoles(accountGuid: string, clientName: string) {
    return getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('userRoles.client', 'client')
      .where(`account.guid = :accountGuid AND client.clientName = :clientName`, {
        accountGuid: accountGuid,
        clientName: clientName
      })
      .getOne();
  }
}

@Injectable()
export class AccountService {
  constructor(public readonly accountRepo: AccountRepo, public readonly roleRepo: RoleRepo) {}

  public default() {
    return 'AccountService';
  }

  public get(guid: string) {
    return this.accountRepo.findOne({
      where: {
        guid: guid
      }
    });
  }
}
