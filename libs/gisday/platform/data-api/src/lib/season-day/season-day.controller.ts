import { Controller, Get, Post, Body, Patch, Param, Delete, NotImplementedException } from '@nestjs/common';
import { SeasonDayService } from './season-day.service';

import { SeasonDay } from '../entities/all.entity';

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

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public create(@Body() createSeasonDayDto: Partial<SeasonDay>) {
    throw new NotImplementedException();
  }

  @Patch(':guid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(@Param('guid') guid: string, @Body() updateSeasonDayDto: Partial<SeasonDay>) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public remove(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }
}
