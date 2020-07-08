import { getConnection } from 'typeorm';
import { CommonService } from '../common/common.service';
import { User } from '../../entities/all.entity';

export class StaticAccountService extends CommonService {
  public static async getUserRoles(accountGuid: string) {
    return getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('userRoles.client', 'client')
      .where(`account.guid = :accountGuid`, {
        accountGuid: accountGuid
      })
      .getOne();
  }
}
