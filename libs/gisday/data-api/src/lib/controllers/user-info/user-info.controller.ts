import { Controller, Get, Patch, Req } from '@nestjs/common';

import { Request } from 'express';

import { UserInfo } from '../../entities/all.entity';
import { UserInfoProvider } from '../../providers/user-info/user-info.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-info')
export class UserInfoController extends BaseController<UserInfo> {
  constructor(private readonly userInfoProvider: UserInfoProvider) {
    super(userInfoProvider);
  }

  @Get()
  public async getUsersInfo(@Req() req: Request) {
    if (req.user) {
      return this.userInfoProvider.getUsersInfo(req);
    } else {
      return;
    }
  }

  @Patch()
  public async updateUserInfo(@Req() req: Request) {
    if (req.user) {
      return this.userInfoProvider.updateUserInfo(req);
    }
  }
}
