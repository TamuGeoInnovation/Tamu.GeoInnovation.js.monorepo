import { Controller, Get, Param, Delete, NotImplementedException, UseGuards } from '@nestjs/common';
import { SeasonDayService } from './season-day.service';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

@Controller('season-days')
export class SeasonDayController {
  constructor(private readonly sd: SeasonDayService) {}

  @Get(':guid/events')
  public getDayEvents(@Param('guid') guid: string) {
    return this.sd.getDayEvents(guid);
  }

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.sd.findOne(guid);
  }

  @Get()
  public findAll() {
    return this.sd.find();
  }

  // POST and PATCH, which only answered 501, were removed (#3796); the tag parked/season-day-writes keeps them. DELETE
  // is not decided yet (#3793 question 7).
  @Permissions(['delete:season-days'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public remove(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }
}
