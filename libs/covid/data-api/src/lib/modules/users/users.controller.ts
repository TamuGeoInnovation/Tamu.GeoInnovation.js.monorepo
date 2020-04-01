import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { User } from '@tamu-gisc/covid/common/entities';

import { UsersService } from './users.service';
import { BaseController } from '../base/base.controller';

@Controller('users')
export class UsersController extends BaseController<User> {
  constructor(private service: UsersService) {
    super(service);
  }

  @Get('verify/:email')
  public async verifyEmail(@Param() params) {
    return this.service.verifyEmail(params.email);
  }

  @Post('')
  public async registerEmail(@Body() body) {
    return this.service.registerEmail(body.email);
  }
}
