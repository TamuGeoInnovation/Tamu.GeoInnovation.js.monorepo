import { getConnection } from 'typeorm';

import { User } from '@tamu-gisc/oidc/common';

import { CommonService } from '../common/common.service';

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
