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
  UseGuards
} from '@nestjs/common';

import { PermissionsGuard, Permissions, JwtGuard } from '@tamu-gisc/common/nest/auth';

import { GisDayAppMetadata, UserInfoProvider } from './user-info.provider';

@Controller('users')
export class UserInfoController {
  constructor(private readonly provider: UserInfoProvider) {}

  @Permissions(['read:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @UseGuards(JwtGuard)
  @Get()
  public async getUsersInfo(@Request() req) {
    return this.provider.getUsersInfo(req.user.sub);
  }

  @Permissions(['create:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity() {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Patch()
  public async updateEntity(@Request() req, @Body() body: GisDayAppMetadata) {
    return this.provider.updateUserInfo(req.user.sub, body);
  }

  @Permissions(['delete:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }
}
