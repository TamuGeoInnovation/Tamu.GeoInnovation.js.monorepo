import { Controller, Get, Post, Body, Patch, Param, Delete, NotImplementedException, UseGuards } from '@nestjs/common';
import { SeasonDayService } from './season-day.service';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

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

  @Permissions(['create:season-days'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public create(@Body() createSeasonDayDto: Partial<SeasonDay>) {
    throw new NotImplementedException();
  }

  @Permissions(['update:season-days'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(@Param('guid') guid: string, @Body() updateSeasonDayDto: Partial<SeasonDay>) {
    throw new NotImplementedException();
  }

  @Permissions(['delete:season-days'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public remove(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }
}
