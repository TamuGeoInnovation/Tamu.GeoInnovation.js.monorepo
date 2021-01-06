import { Controller, Get, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { CheckIn } from '../../entities/all.entity';
import { BaseController } from '../../controllers/_base/base.controller';
import { CheckInProvider } from '../../providers/check-in/check-in.provider';

@Controller('check-in')
export class CheckInController extends BaseController<CheckIn> {
  constructor(private readonly checkinProvider: CheckInProvider) {
    super(checkinProvider);
  }

  @Get('all')
  public async getUsersCheckins(@Req() req: Request) {
    if (req.user) {
      return this.checkinProvider.getEntitiesForUser(req);
    } else {
      return;
    }
  }

  @Post('user')
  public async insertUserCheckin(@Req() req: Request) {
    const { eventGuid } = req.body;
    if (req.user) {
      const accountGuid = req.user.sub;
      return this.checkinProvider.insertUserCheckin(eventGuid, accountGuid);
    } else {
      // someone not logged in tried to checkin
      return;
    }
  }
}
