import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SeasonService } from './season.service';
import { Season } from '../entities/all.entity';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('active')
  public findActiveSeason() {
    return this.seasonService.findOneActive();
  }

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.seasonService.findOneWithOrderedDays(guid);
  }

  @Get()
  public findAll() {
    return this.seasonService.findAllOrdered();
  }

  @Permissions(['create:seasons'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public create() {
    return this.seasonService.clonePreviousSeason();
  }

  @Permissions(['update:seasons'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public update(@Param('guid') guid: string, @Body() updateSeasonDto: Partial<Season>) {
    return this.seasonService.updateSeason(guid, updateSeasonDto);
  }

  @Permissions(['delete:seasons'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.seasonService.deleteEntity(guid);
  }
}
