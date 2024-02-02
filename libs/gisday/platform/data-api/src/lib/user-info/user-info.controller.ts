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

  @UseGuards(JwtGuard)
  @Get(':guid/metadata')
  public async getUsersInfo(@Request() req) {
    return this.provider.getUserMetadata(req.user.sub);
  }

  @Permissions(['read:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid')
  public async getUser(@Param('guid') guid) {
    return this.provider.getUser(guid);
  }

  @Permissions(['read:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get()
  public async getAllUsers() {
    return this.provider.getUsers();
  }

  @Permissions(['create:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity() {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Patch(':guid/metadata')
  public async updateUserMetadata(@Request() req, @Body() body: GisDayAppMetadata) {
    return this.provider.updateUserMetadata(req.user.sub, body);
  }

  @Permissions(['delete:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteUser() {
    throw new NotImplementedException();
  }
}
