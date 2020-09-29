import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserRsvp } from '../../entities/all.entity';
import { UserRsvpProvider } from '../../providers/user-rsvp/user-rsvp.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-rsvp')
export class UserRsvpController extends BaseController<UserRsvp> {
  constructor(private readonly userRsvpProvider: UserRsvpProvider) {
    super(userRsvpProvider);
  }

  @Get('/user/:guid')
  async getUserRsvps(@Param() params) {
    return this.userRsvpProvider.getUserRsvps(params.guid);
  }

  @Post('/')
  async insertUserRsvp(@Req() req) {
    return this.userRsvpProvider.insertUserRsvp(req);
  }
}
