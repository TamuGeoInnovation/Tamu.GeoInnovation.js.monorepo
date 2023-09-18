import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as deepmerge from 'deepmerge';
import { Repository } from 'typeorm';

import { UserInfo } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UserInfoProvider extends BaseProvider<UserInfo> {
  constructor(@InjectRepository(UserInfo) private userInfoRepo: Repository<UserInfo>) {
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

  public async updateUserInfo(accountGuid: string, updatedUserInfo: Partial<UserInfo>) {
    const entity = await this.userInfoRepo.findOne({
      where: {
        accountGuid: accountGuid
      }
    });

    if (entity) {
      const merged = deepmerge(entity as Partial<UserInfo>, updatedUserInfo);

      return this.userInfoRepo.save(merged);
    } else {
      // throw new Error('Could not find entity to update');
      updatedUserInfo.accountGuid = accountGuid;
      this.save(updatedUserInfo);
    }
  }
}
