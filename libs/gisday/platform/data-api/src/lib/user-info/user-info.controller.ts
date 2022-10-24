import { Controller, Get, Patch, Request, UnauthorizedException } from '@nestjs/common';

import { UserInfo } from '../entities/all.entity';
import { UserInfoProvider } from './user-info.provider';
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
      throw new UnauthorizedException();
    }
  }

  @Patch()
  public async updateUserInfo(@Request() req) {
    if (req.user) {
      const _updatedUserInfo: Partial<UserInfo> = {
        ...req.body
      };
      return this.userInfoProvider.updateUserInfo(req.user.sub, _updatedUserInfo);
    } else {
      throw new UnauthorizedException();
    }
  }
}
