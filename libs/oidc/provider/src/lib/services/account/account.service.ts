import { getConnection } from 'typeorm';

import { AccountRepo, User } from '../../../../../common/src/lib/entities/all.entity';

import { CommonService } from '../common/common.service';
import { Injectable } from '@nestjs/common';
import { RoleRepo } from '@tamu-gisc/oidc/common';

export class StaticAccountService extends CommonService {
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
