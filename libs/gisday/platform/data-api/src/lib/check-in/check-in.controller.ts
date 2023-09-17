import { Controller, Get, Post, Request, Body, UseGuards, ForbiddenException } from '@nestjs/common';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { CheckIn } from '../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { CheckInProvider } from './check-in.provider';

@Controller('check-in')
export class CheckInController extends BaseController<CheckIn> {
  constructor(private readonly checkinProvider: CheckInProvider) {
    super(checkinProvider);
  }

  @Get('all')
  public async getUsersCheckins(@Request() req) {
    // TODO: May need some angular-auth-oidc-client magic here
    if (req.user) {
      // return this.checkinProvider.getEntitiesForUser(req.user.sub);
      return this.checkinProvider.find({
        where: {
          accountGuid: req.user.sub
        }
      });
    } else {
      return new ForbiddenException();
    }
  }

  @Post('user')
  @UseGuards(JwtGuard)
  public async insertUserCheckin(@Body() body) {
    // TODO: Use HttpInterceptor to bind accountGuid to body since NestAuthGuard only allows request to progress here
    const { eventGuid, accountGuid } = body;

    return this.checkinProvider.insertUserCheckin(eventGuid, accountGuid);
  }
}
