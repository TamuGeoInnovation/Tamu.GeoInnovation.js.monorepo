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
import { AccountDashboardProvider } from './account-dashboard.provider';

@Controller('users')
export class UserInfoController {
  constructor(
    private readonly provider: UserInfoProvider,
    private readonly dashboard: AccountDashboardProvider
  ) {}

  /** The User accounts dashboard (#2892): a season's accounts, counts only. Before `:guid`, which would match it. */
  @Permissions(['read:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('dashboard/season/:guid')
  public async getDashboardForSeason(@Param('guid') guid: string) {
    return this.dashboard.getSeason(guid);
  }

  /** The people of one of its rows, by the row's key: names and emails leave the API only one row at a time. */
  @Permissions(['read:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('dashboard/season/:guid/row/:key')
  public async getDashboardRow(@Param('guid') guid: string, @Param('key') key: string) {
    return this.dashboard.getRow(guid, key);
  }

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
