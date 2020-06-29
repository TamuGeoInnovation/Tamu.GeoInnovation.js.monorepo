import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { User } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';
import { BaseController } from '../base/base.controller';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

@Controller('users')
export class UsersController extends BaseController<User> {
  constructor(private service: UsersService) {
    super(service);
  }

  @Get('verify/:email')
  public async verifyEmail(@Param() params) {
    return this.service.verifyEmail(params.email);
  }

  @UseGuards(AdminRoleGuard)
  @Get('stats')
  public async getUsersWithStats() {
    try {
      const users = this.service.getUsersWithStats();
      return users;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @UseGuards(AdminRoleGuard)
  @Get('')
  public async getUsers() {
    try {
      const users = this.service.getUsers();
      return users;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Post('')
  public async registerEmail(@Body() body) {
    return this.service.registerEmail(body.email);
  }
}
