import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { UserRsvp } from '../entities/all.entity';
import { UserRsvpProvider } from './user-rsvp.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-rsvps')
export class UserRsvpController extends BaseController<UserRsvp> {
  constructor(private readonly userRsvpProvider: UserRsvpProvider) {
    super(userRsvpProvider);
  }

  @Get('/user/:guid')
  public async getUserRsvps(@Param() params) {
    return this.userRsvpProvider.getUserRsvps(params.guid);
  }

  @Post('/')
  public async insertUserRsvp(@Body() body) {
    const { eventGuid, rsvpTypeGuid, userGuid } = body;

    return this.userRsvpProvider.insertUserRsvp(eventGuid, rsvpTypeGuid, userGuid);
  }
}
