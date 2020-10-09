import { Injectable } from '@nestjs/common';
import * as deepmerge from 'deepmerge';
import { Request } from 'express';
import { UserInfo, UserInfoRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class UserInfoProvider extends BaseProvider<UserInfo> {
  constructor(private readonly userInfoRepo: UserInfoRepo) {
    super(userInfoRepo);
  }

  async getUsersInfo(req: Request) {
    const accountGuid = req.user.sub;
    const userInfo = await this.userInfoRepo.findOne({
      where: {
        accountGuid: accountGuid
      }
    });
    return userInfo;
  }

  async updateUserInfo(req: Request) {
    const entity = await this.userInfoRepo.findOne({
      where: {
        accountGuid: req.user.sub
      }
    });
    if (entity) {
      const merged = deepmerge(entity as Partial<UserInfo>, req.body);
      return this.userInfoRepo.save(merged);
    } else {
      // throw new Error('Could not find entity to update');
      if (req.user) {
        req.body.accountGuid = req.user.sub;
      }
      this.insertEntity(req);
    }
  }
}
