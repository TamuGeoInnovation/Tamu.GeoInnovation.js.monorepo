import { Controller, Get, Param } from '@nestjs/common';
import { SeasonDayService } from './season-day.service';

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

  // POST, PATCH and DELETE, which only answered 501, were removed (#3796, #3896); the tag parked/season-day-writes
  // keeps them.
}
