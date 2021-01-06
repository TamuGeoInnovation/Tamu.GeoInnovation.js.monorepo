import { Injectable } from '@nestjs/common';

import * as deepmerge from 'deepmerge';

import { UserInfo, UserInfoRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class UserInfoProvider extends BaseProvider<UserInfo> {
  constructor(private readonly userInfoRepo: UserInfoRepo) {
    super(userInfoRepo);
  }

  public async getUsersInfo(accountGuid: string) {
    const userInfo = await this.userInfoRepo.findOne({
      where: {
        accountGuid: accountGuid
      }
    });
    return userInfo;
  }

  public async updateUserInfo(accountGuid: string, _updatedUserInfo: Partial<UserInfo>) {
    const entity = await this.userInfoRepo.findOne({
      where: {
        accountGuid: accountGuid
      }
    });
    if (entity) {
      const merged = deepmerge(entity as Partial<UserInfo>, _updatedUserInfo);
      return this.userInfoRepo.save(merged);
    } else {
      // throw new Error('Could not find entity to update');
      _updatedUserInfo.accountGuid = accountGuid;
      this.insertEntity(_updatedUserInfo);
    }
  }
}
