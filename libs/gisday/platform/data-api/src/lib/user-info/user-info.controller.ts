import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { UserInfo } from '../entities/all.entity';
import { UserInfoProvider } from './user-info.provider';

@Controller('user-infos')
export class UserInfoController {
  constructor(private readonly provider: UserInfoProvider) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getUsersInfo(@Request() req) {
    if (req.user) {
      return this.provider.getUsersInfo(req.user.sub);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<UserInfo>) {
    throw new NotImplementedException();
  }

  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<UserInfo>, @Request() req) {
    if (req.user) {
      const _updatedUserInfo: Partial<UserInfo> = {
        ...req.body
      };
      return this.provider.updateUserInfo(req.user.sub, _updatedUserInfo);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
