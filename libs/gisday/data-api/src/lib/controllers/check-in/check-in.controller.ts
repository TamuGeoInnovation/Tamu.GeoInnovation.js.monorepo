import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CheckIn } from '../../entities/all.entity';
import { BaseController } from '../../controllers/_base/base.controller';
import { CheckInProvider } from '../../providers/check-in/check-in.provider';

@Controller('check-in')
export class CheckInController extends BaseController<CheckIn> {
  constructor(private readonly checkinProvider: CheckInProvider) {
    super(checkinProvider);
  }

  @Post('user')
  public async insertUserCheckin(@Req() req: Request) {
    return this.checkinProvider.insertUserCheckin(req);
  }
}
