import { Controller, Get, Patch, Request } from '@nestjs/common';

import { UserInfo } from '../../entities/all.entity';
import { UserInfoProvider } from '../../providers/user-info/user-info.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-info')
export class UserInfoController extends BaseController<UserInfo> {
  constructor(private readonly userInfoProvider: UserInfoProvider) {
    super(userInfoProvider);
  }

  @Get()
  public async getUsersInfo(@Request() req) {
    if (req.user) {
      return this.userInfoProvider.getUsersInfo(req.user.sub);
    } else {
      return;
    }
  }

  @Patch()
  public async updateUserInfo(@Request() req) {
    if (req.user) {
      const _updatedUserInfo: Partial<UserInfo> = {
        ...req.body
      };
      return this.userInfoProvider.updateUserInfo(req.user.sub, _updatedUserInfo);
    }
  }
}
